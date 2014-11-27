/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global exports */

'use strict';

const promises = require('sdk/core/promise');
const { defer, resolve } = promises;

let utils = require('./utils-for-testing');

let flow = require("flow");
let Q = require("arms").questions[0];


let { uu } = require("utils");

console.log(uu());

let create = () => flow.create(uu(), Q);

exports['test create needs config'] = function (assert) {
  assert.throws(() => flow.create());
  assert.pass("good!");
};

exports['test wrong ordered flows are bad'] = function (assert) {
  ["offered", "voted", "engaged"].map(function (k) {
    create();  // resets.
    assert.throws(flow[k]);
  });
};

exports['test right ordered flow steps work'] = function (assert) {
  for (let k in flow.phases) {
    console.log("phase", k);
    create();
    let reqs = flow.phases[k];
    reqs.map((r) => {  // run all stages
      flow[r]();
    });
    flow[k]();// do it!
    assert.pass(k + " works after requirements");
  }
  assert.pass();
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
