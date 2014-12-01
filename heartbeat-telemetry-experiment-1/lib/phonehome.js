/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global */

"use strict";





const promises = require("sdk/core/promise");
const request = require("sdk/request");
const { extend } = require("sdk/util/object");
const myprefs = require("sdk/simple-prefs").prefs;

const personinfo = require("personinfo");

const { validate } = require("upload-validate");
const flow = require("flow");

/** POST API information for Heartbeat
  * http://fjord.readthedocs.org/en/latest/hb_api.html
  */


/** add common fields such as timestamp, userid, etc. to event data
  * fields will be appending in newkey 'extra', which is a dict.
  *
  * Note:  modifies and returns the ORIGINAL OBJECT [1]
  *        if this is unwanted:  `annotate(extend({},obj))`
  *
  */
let annotate = exports.annotate = function (obj) {
  let { promise, resolve } = promises.defer();
  obj = extend({}, flow.current(), obj);

  obj.person_id = myprefs.person_id;
  obj.survey_id = myprefs.survey_id;
  obj.variation_id = myprefs.armname;

  obj.response_version = 1;
  obj.updated_ts = Date.now();

  personinfo.getData().then(
    function (data) {
      obj.platform = data.os; // will be better
      obj.channel = data.updateChannel;
      obj.version = data.fxVersion;
      obj.locale = data.location;

      // modified per https://bugzilla.mozilla.org/show_bug.cgi?id=1092375
      obj.build_id = data.prefs['gecko.buildID'] || "-";
      obj.partner_id = data.prefs['distribution.id'] || "-";
      obj.profile_age = data.profileageCeilingCapped365; // capped at 365.  rounded
      obj.profile_usage = {total30:data.sumMs30, useddays30: data.useddays30};

      obj.addons = {"addons": data.addons};
      obj.extra = {
        crashes: data.crashes,
        //prefs: data.prefs,  // dropped per https://bugzilla.mozilla.org/show_bug.cgi?id=1092375
        engage: obj.flow_links,
        numflows: myprefs.numflows
      };

      obj.experiment_version = data.addonVersion;
      resolve(obj);
    }
  );
  return promise;
};

/** base configuration of the phonehome module / function
  *
  */
let config = exports.config  = {
  phonehome: false,   // will it send?
  testing: true,         // append on a flag?
  url: "https://input.mozilla.org/api/v2/hb/",
  //url: "https://testpilot.mozillalabs.com/submit/" + "pulse-uptake-experiment",
  extraData:  null
};

/** Send data to Heartbeat Input
  *
  *
  * args:
  *    dataObject:  POJO with event related keys, validates
  *    options:  same keys as `config`, temporarily overriding them.
  *
  * promises:
  *    Response [1][2]
  *
  *
  * Note 1: if (!options.phonehome)), return Request instead
  *
  * Note 2: Success will be
  *   - statusCode = 201 (input heartbeat)
  *   - statusCode = 0 (local file)
  *   - statusCode = ??? (other systems, mostly 200)
  *
  *
  * Note 3: payloads are finite in size (several megs?) for bagheera
  *         and will die silently (?) on rejection.
  **/
let phonehome = exports.phonehome = function(dataObject, options){
  dataObject = dataObject || {};

  options = extend({}, config, options);

  let { promise, reject, resolve } = promises.defer();
  function requestCompleted(which, cb, response) {
    // FUTURE: worth catching errors here?  If so, so what to do next?
    //console.log("REQUEST COMPLETE", which, response.status, response.text);
    cb(response);
  }

  dataObject.is_test = !!options.testing;

  let send = function (dataObject) {
    /** TP packet
      * - special url
      * - POST instead of get
      * - explicit about content type.
      * - will autogen a record at /bagheera end
      */
    var XMLReqTP = new request.Request({
      url: options.url,
      headers: {'Accept': 'application/json; indent=4'},
      onComplete: requestCompleted.bind(null,"HeartbeatInput", resolve),
      content: JSON.stringify(dataObject),
      contentType: "application/json"
    });

    console.log("HeartbeatInput REQUESTS");
    console.log(JSON.stringify(dataObject,null,2));

    if (options.phonehome) {
      console.log("posting");
      XMLReqTP.post();

    } else {
      console.log("phonehome, blocked by configuration");
      resolve(XMLReqTP); /* return the request, won't have status */
    }
  };

  // this becomes a promise.
  dataObject = annotate(dataObject);

  // or things like testpilot and such.
  let addExtra = function (dataObject) {
    if (options.extraData) {
      dataObject.extra = extend({}, dataObject.extra || {}, options.extraData);
    }
    return dataObject
  }


  // remember, validate strips extra fields silently!
  let wrap_valid = (d) => {
    try {
      return (validate(d)); // may turn into a reject.
    } catch (exc) {
      console.log(exc);
      reject(exc);
    }
  };

  dataObject.then(
  addExtra).then(
  wrap_valid).then(
  send).then(
    null,
    console.error);

  return promise;
};
