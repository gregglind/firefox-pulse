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

var self = require('sdk/self');

const experiment = require("experiment");
const phonehome = require("phonehome");
const arms = require("arms");
const micropilot = require("micropilot-trimmed");

const promises = require("sdk/core/promise");
const { defer, resolve } = promises;


let main = exports.main = function (options, callback) {
  console.log("running");
  // args
  options = options.staticArgs || {};

  if (options.showui) {
    require("./ui/ui-demo");
    let tabs = require("sdk/tabs");
    //tabs.open(self.data.url(""));
    tabs.open(self.data.url("ui-demo.html"));
    //tabs.open(self.data.url("question.html"));
  }

  if (options.reset) {
    experiment.reset();
  }

  // global phone home options
  if (options.phonehome !== undefined) {
    phonehome.config.phonehome = options.phonehome;  // default: false
  }
  if (options.testing !== undefined) {
    phonehome.config.testing = options.testing;  // default: true
  }

  if (options.delay !== undefined) {
    arms.config.delay = options.delay;  // default: 5 * 60 * 1000 / 5min
    arms.regenerate();
  }


  let armnumber; // undef;

  if (options.armnumber !== undefined) {
    console.log("force setting arm");
    armnumber = Number(options.armnumber,10);
  }

  let killafter = options.killafter; // how long to let run for
  if (killafter) killafter = Number(killafter, 10);

  // death functions
  let dontdie = function () {
    console.log("run indefinitely");
    return resolve(false); // don't die!
  };

  let yesdie = function () {
    // will die
    let {promise, resolve} = defer();
    let deadline = experiment.firstrunts() + killafter; // ms
    if (Date.now() >= deadline) {
      micropilot.killaddon();
      resolve(true);
    } else {
      resolve(false);
    }
    return promise;
  };

  let die = dontdie;
  if (killafter) {
    die = yesdie;
  }

  // upgrades
  //

  // standard sequence - a la a unit test
  let setup;

  if (experiment.isSetup()) {
    setup = resolve(experiment.revive()); // first time!
  } else {
    setup = experiment.firstStartup(armnumber);  // else!
  }


  let run_if_not_ran = function () {
    if (experiment.ran()) {
      console.log("already ran");
      resolve(true);
    } else {
      console.log("will run");
      return experiment.everyRun();
    }
  };

  setup.then(   // all side effects.
  die).then(
  run_if_not_ran).then(   // - run if not ran
  ).then(
  ).then(
  null, console.error // all errors;
  );

  // - teardown
};

// teardown
