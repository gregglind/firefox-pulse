/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global */

'use strict';

const promises = require('sdk/core/promise');
const { defer, resolve } = promises;

let utils = require('./utils-for-testing');

let { uu } = require("utils");
let Q = require("arms").questions[0];
let flow = require("flow");
let experiment = require("experiment");
let phonehome = require("phonehome");

let unblob = function(request) {
  return JSON.parse(request.content);
};

exports['test phonehome fake'] = function(assert, done) {
  done = utils.doneclean(done);
  let flow_id = uu();
  experiment.firstStartup().then(
  () => {flow.create(flow_id, Q);}).then(
  () => phonehome.phonehome(undefined, {
      phonehome: false,
      annotate: true,
      testing: true
  })).then(
  (response) => {
    assert.equal(unblob(response).is_test, true, "has testing");
    done();
  });
};

exports['test phonehome real'] = function(assert, done) {
  done = utils.doneclean(done);
  let flow_id = uu();
  experiment.firstStartup().then(
  () => {flow.create(flow_id, Q);}).then(
  () => phonehome.phonehome(undefined, {
      phonehome: true,
      testing: true})
  ).then(
  (response) => {
    console.log("awesome!");
    assert.equal(response.status, 201, "response good!");
    done();
  }
  );
};

/** model test.  copy as necessary!

// REMEMEBER, if done() is your last step in a test
// it's probably not really async()


exports['test asyn'] = function(assert, done) {
  done = utils.doneclean(done);
  assert.pass();
  done();
};

exports['test sync'] = function(assert) {
  assert.pass();
};


*/

require('sdk/test').run(exports);
