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

const myprefs = require('sdk/simple-prefs').prefs;
let triggers = require('triggers');
let arms = require('arms');
let experiment = require('experiment');

const { emit } = require('sdk/event/core');


let utils = require('./utils-for-testing');

let sum = (array) => {
  return array.reduce(function(a, b) {
    return a + b;
  });
};

exports['test changeArm changes arm'] = function(assert) {
  assert.pass();
  let seen = [];
  let fn = function (i) {
    seen[i] = 1;
  };
  let o = experiment.observer.on("set-arm", fn);
  arms.ARMS().forEach( (el, i) => {
    experiment.setupArm(i); // should trigger set-arm
  });
  experiment.observer.off('set-arm', o);
  assert.equal(sum(seen), arms.ARMS().length, "all arms seen");
};

exports['test experiment everyRun starts a flow'] = function(assert, done) {
  done = utils.doneclean(done);
  experiment.reset();
  experiment.observer.once("flow", function(armnumber) {
    assert.pass();
    triggers.reset();
    done();
  });
  experiment.setupArm();
  emit(experiment.observer,"lateenough");  // lie!  like a rug!
  experiment.everyRun(); // async, should trigger flow.
};

exports['test experiment firstStartup sets data'] = function(assert, done) {
  assert.pass();
  done = utils.doneclean(done);
  experiment.firstStartup().then(
  () => {
    assert.ok(myprefs.armnumber !== undefined, "armnumber is set");
    assert.ok(myprefs.person_id !== undefined, "person is set");
    done();
  });
};

exports['test experiment reset clears data'] = function(assert) {
  myprefs.armnumber = 1;
  assert.equal(myprefs.armnumber, 1, 'armnumber set');
  experiment.reset();
  assert.equal(myprefs.armnumber, undefined, 'armnumber clears');
};


exports['test isSetup'] = function(assert, done) {
  done = utils.doneclean(done);
  experiment.reset();
  assert.ok(!experiment.isSetup(), "resetting unsetups experiment");
  experiment.firstStartup().then(
  () =>{
    assert.ok(experiment.isSetup(), "experiment now setup");
    done();
  });
};

/** model test.  copy as necessary!

exports['test nothing'] = function(assert, done) {
  done = utils.doneclean(done);

};

*/

require('sdk/test').run(exports);
