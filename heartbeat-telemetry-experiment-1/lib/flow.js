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

const myprefs = require("sdk/simple-prefs").prefs;
const { extend } = require("sdk/util/object");

console.log("flow, no promises");

// FUTURE: should be event based / part of hte experiment tracker

let flow_base = {
  // COMPARED TO upload-validate, for ref.

  //"person_id": vstring('person_id', false), // "c1dd81f2-6ece-11e4-8a01-843a4bc832e4",
  //"survey_id": vstring('survey_id', false), //"lunch",
  "flow_id": "", //vstring('flow_id', false), // "20141117_attempt1",
  "question_id": "", //"howwaslunch",
  "response_version": 1, // 1
  //"updated_ts": vTimestamp('updated_ts', false),  // 1416011156000,
  "question_text": "", // vstring('question_text', false),  //"how was lunch?",
  "variation_id": "",  //vstring('variation_id', false),  // "1",

  // fields for this study...
  "score": null, //vScore("score"),  // null,
  "max_score": null, //vScore("max_score"),   //
  "flow_began_ts": 0, //vTimestamp("flow_began_ts"),  //
  "flow_offered_ts": 0, // vTimestamp("flow_offered_ts"),  //
  "flow_voted_ts": 0, //vTimestamp("flow_voted_ts"),   //
  "flow_engaged_ts": 0, //vTimestamp("flow_engaged_ts"),  //
  //// system
  //"platform": //"" vstring('platform', false),        //
  //"channel": // vstring('channel', false),         //
  //"version": //vstring('version', false),          //
  //"locale": // vstring('locale', false),           //
  //"build_id": //vstring('build_id', false),         //
  //"partner_id": //vstring('partner_id', false),       //
  //"profile_age": //vNumber('profile_age'),    //
  //"profile_usage": //vJsonableObject("profile_usage"),    //
  //"addons": // vArray("addons"),           //
  //"extra": // vJsonableObject("extra"),
  //// is this real?
  //"is_test": vboolean('is_test') //true

  "flow_links": []  // array of (ts, id)
};

let _current;


// a bit gruesome.  Avoiding writing a full state depedency checker
let phases = exports.phases =   {
  "began": [],
  "offered": ['began'],
  "voted": ['began', 'offered', ],
  "engaged": ['began', 'offered', 'voted']
};

// order of phases.
let provePhaseReady = function (phase) {
  let reqs = phases[phase];
  reqs.forEach(function(k) {
    let key = "flow_" + k + "_ts";
    if (_current[key] <= 0) {
      throw phase + " requires " + k;
    }
  });
};

let create = exports.create = function (flow_id, Q) {
  _current = extend({}, flow_base);
  _current.flow_id = flow_id;
  _current.question_text = Q.msg;
  _current.question_id = Q.alias;
  _current.max_score = Q.max_score;

  // https://bugzilla.mozilla.org/show_bug.cgi?id=1092375#c11
  if (!myprefs.numflows) myprefs.numflows = 0;
  myprefs.numflows += 1;

};

let persist = exports.persist = function () {
  myprefs.current = JSON.stringify(_current);
};

let revive = exports.revive = function () {
  _current = JSON.parse(myprefs.current);
};

//
let link = exports.link = function (action, whichpage) {
  console.log("linking at flow!");
  _current.flow_links.push([Date.now(), action, whichpage]);
  persist();
};

let rate = exports.rate = function (n) {
  _current.score = n;
  persist();
};

// module getter
let current = exports.current = () => _current;

// only accept 'first set' for these.
["began", "offered", "voted", "engaged"].forEach(function (k) {
  exports[k] = function (ts) {
    provePhaseReady(k); //
    console.log("flow", k);
    let key = "flow_" + k + "_ts";
    if (key in _current) {
      if (_current[key] === 0) {
        _current[key] = ts || Date.now();
        persist()
      }
    } else {
      throw "Bad key in current flow: " + key;
    }
  };
});
