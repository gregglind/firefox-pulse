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

let phonehome = require("phonehome");

let experiment = require('experiment');
let triggers = require("triggers");


let unblob = function(request) {
  return JSON.parse(request.content);
};

exports['test annotate'] = function(assert, done) {
  done = utils.doneclean(done);
  let expected = [
    "addonVersion",
    "addons",
    "appname",
    "armname",
    "armnumber",
    "configured",
    "crashes",
    "firstrunts",
    "fxVersion",
    "location",
    "os",
    "person",
    "prefs",
    "profileage",
    "sumMs",
    "ts",
    "updateChannel"
  ];
  let o = {a:1};

  // need to set up prefs!
  experiment.firstStartup().then(
  triggers.reset
  ).then(
  () => phonehome.annotate(o)).then(
  () => {
    assert.deepEqual(
      Object.keys(o.extra).sort(),
      expected,
      "annotate adds lots of info"
    );
    experiment.reset(); // cleanup!
    done();
  });
};

exports['test some config variations'] = function(assert, done) {
  let o = {a:1};
  done = utils.doneclean(done);

  phonehome.phonehome(o, {
      phonehome: false,
      annotate: true,
      testing: true}).then(
    (response) => {
      assert.ok(unblob(response).extra !== undefined, "has anno");
      assert.equal(unblob(response).testing, true, "has testing");
      done();
    }
  );
};

exports['test other config variations'] = function(assert, done) {
  let o = {a:1};
  done = utils.doneclean(done);
  phonehome.phonehome(o, {
      phonehome: false,
      annotate: false,
      testing: false}).then(
    (response) => {
      assert.ok(unblob(response).extra === undefined, "no annotation, as expected");
      assert.ok(!unblob(response).testing, "no testing or undefined");
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
