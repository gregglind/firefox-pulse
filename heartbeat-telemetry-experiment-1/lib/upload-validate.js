/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global exports, require */

"use strict";

const apiUtils = require("sdk/deprecated/api-utils");

// TODO, handle 'emptiness' for non-strings

let vstring = function (name, emptyok ) {
  let msgs = [" must be a non-empty string", " must be a string"];
  return {
    is: ["string"],
    ok: (val) => emptyok || val.length > 0,
    msg: name + msgs[!!emptyok]
  };
};

let vScore = function(name) {
  return {
    //map: (val) => Number(val,10),
    is: ["number", 'null'],
    //ok: (val) => val === null ||
    msg: name + " must be a Number or Null to be a Score"
  };
};

let vJsonableObject = function (name) {
  return {
    is: ['object'],
    ok: (val) => JSON.stringify(val)[0]==="{",
    msg: name + " not jsonable, or not object"
  };
};

let vArray = function (name) {
  return {
    is: ['array'],
    //ok: (val) => JSON.stringify(val)[0]==="{",
    msg: name + " not Array"
  };
};


let vNumber = function (name) {
  // empty isn't handled here.
  return {
    is: ["number"],
    msg: name + "not a Number"
  };
};

let vboolean = function (name) {
  return {
    is: ["boolean"]
  };
};

let vTimestamp = function (name) {
  return {
    is: ["number"],
    ok: (val) => val >= 0,
    msg: name + " doesn't look like a js timestamp or 0.  Can't be negative."
  };
};

//let vuuid = function (name, emptyok) {
//  let out = vstring(name, emptyok);
//  out.ok = (val) => emptyok || val.length >
//  extends() {} vstring);
//

/**
returns object with keys good, errros
*/
let validate = exports.validate = function (packet) {
  //let errors = [];
  //let good = true;
  let rules = {
    "person_id": vstring('person_id', false), // "c1dd81f2-6ece-11e4-8a01-843a4bc832e4",
    "survey_id": vstring('survey_id', false), //"lunch",
    "flow_id": vstring('flow_id', false), // "20141117_attempt1",
    "question_id": vstring('question_id', false), //"howwaslunch",
    "response_version": vNumber("response_version", false), // 1
    "updated_ts": vTimestamp('updated_ts', false),  // 1416011156000,
    "question_text": vstring('question_text', false),  //"how was lunch?",
    "variation_id": vstring('variation_id', false),  // "1",
    // fields for this study...
    "score": vScore("score"),  // null,  TODO, 0 is a valid score for nps
    "max_score": vScore("max_score"),   //
    "flow_began_ts": vTimestamp("flow_began_ts"),  //
    "flow_offered_ts": vTimestamp("flow_offered_ts"),  //
    "flow_voted_ts": vTimestamp("flow_voted_ts"),   //
    "flow_engaged_ts": vTimestamp("flow_engaged_ts"),  //
    // system
    "platform": vstring('platform', false),        //
    "channel": vstring('channel', false),         //
    "version": vstring('version', false),          //
    "locale": vstring('locale', false),           //
    "build_id": vstring('build_id', false),         //
    "partner_id": vstring('partner_id', false),       //
    "profile_age": vNumber('profile_age'),    //
    "profile_usage": vJsonableObject("profile_usage"),    //
    "addons": vArray("addons"),           //
    "extra": vJsonableObject("extra"),
    // is this real?
    "is_test": vboolean('is_test'), //true
  };
  return apiUtils.validateOptions(packet, rules);
  //return {good:good, errors: errors };
};


