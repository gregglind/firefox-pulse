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
const { defer, resolve } = promises;
const request = require("sdk/request");
const { extend } = require("sdk/util/object");
const myprefs = require("sdk/simple-prefs").prefs;

const personinfo = require("personinfo");

/** add common fields such as timestamp, userid, etc. to event data
  * fields will be appending in newkey 'extra', which is a dict.
  *
  * Note:  modifies and returns the ORIGINAL OBJECT [1]
  *        if this is unwanted:  `annotate(extend({},obj))`
  *
  */
let annotate = exports.annotate = function (obj) {
  let { promise, resolve } = defer();
  // experiment arm?
  // etc!
  // addon version?
  // person id?
  // do they have abp?
  // etc?
  obj.extra = {};
  for (let k in myprefs) {
    obj.extra[k] = myprefs[k];
  }
  //
  obj.extra.ts = Date.now();

  personinfo.getData().then(
    function (data) {
      obj.extra = extend({}, obj.extra, data);
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
  url: "https://testpilot.mozillalabs.com/submit/" + "pulse-uptake-experiment",
  annotate: true
};

/** Send data to test pilot / bagheera
  *
  * note: called mostly by sendEvent.
  *
  * args:
  *    dataObject:  POJO with event related keys
  *    options:  same keys as `config`, temporarily overriding them.
  *
  * promises:
  *    Response [1][2]
  *
  *
  * Note 1: if (!options.phonehome)), return Request instead
  *
  * Note 2: Success will be
  *   - statusCode = 201 (bagheera)
  *   - statusCode = 0 (local file)
  *   - statusCode = ??? (other systems, mostly 200)
  *
  *
  * Note 3: payloads are finite in size (several megs?) for bagheera
  *         and will die silently (?) on rejection.
  **/
let phonehome = exports.phonehome = function(dataObject, options){
  options = extend({}, config, options);

  let { promise, resolve } = defer();
  function requestCompleted(which, cb, response) {
    console.log("REQUEST COMPLETE", which, response.status);
    cb();
  }

  if (options.testing) {
    dataObject.testing = true;
  }

  let send = function (dataObject) {
    /** TP packet
      * - special url
      * - POST instead of get
      * - explicit about content type.
      * - will autogen a record at /bagheera end
      */
    var XMLReqTP = new request.Request({
      url: options.url,
      headers: {},
      onComplete: requestCompleted.bind(null,"TP", resolve),
      content: JSON.stringify(dataObject),
      contentType: "application/json",
    });

    console.log("TP REQUESTS");
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
  if (options.annotate) {
    dataObject = annotate(dataObject);
  } else {
    dataObject = promises.resolve(dataObject);
  }

  dataObject.then(send).then(
    null,
    console.error);

  return promise;

};
