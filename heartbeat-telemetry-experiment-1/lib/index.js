/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global exports, require, console*/

"use strict";

const promises = require("sdk/core/promise");
const { defer, resolve } = promises;
const self = require('sdk/self');

const experiment = require("experiment");
const phonehome = require("phonehome");
const arms = require("arms");
const micropilot = require("micropilot-trimmed");

const { emit } = require('sdk/event/core');
const apiUtils = require("sdk/deprecated/api-utils");

const { hasE10s } = require("e10s");

if (hasE10s()) {
  micropilot.killaddon();
}


let validateStaticArgs = function (staticArgs) {
  let rules = {
    showui: {is: ['boolean']},
    reset: {is: ['boolean']},
    phonehome: {is: ['boolean']},
    testing: {is: ['boolean']},
    delay: {is: ['number'], ok: (x)=> x>0, msg: "delay must be non-neg"}, // pos!
    armnumber: {is: ['number'],
      ok: (x)=> (x>=0) && (x < arms.ARMS().length),
      msg: "armnumber must be int in [0,"+ (arms.ARMS().length-1) + "]"},
    killafter:  {is: ['number']},
    lateenough: {is: ['boolean']}
  };

  Object.keys(staticArgs).forEach(function (k){
    if (k in rules) {
      let r = {};
      let o = {};
      o[k] = staticArgs[k];
      r[k] = rules[k];
      apiUtils.validateOptions(o, r);
    } else {
      throw "staticArg option unknown: " + k;
    }
  });
};

/**
  *
  * allowed options
  * - showui
  * - reset
  * - phonehome
  * - testing
  * - delay  (until showing question)
  * - killafter
  * - lateenough - boolean, debug flag
  *
  */
let main = exports.main = function (options, callback) {

  options = options.staticArgs || {};

  validateStaticArgs(options);

  if (options.showui) {
    require("./ui/ui-demo");
    let tabs = require("sdk/tabs");
    tabs.open(self.data.url("ui-demo.html"));
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

  // options.lateenough # handled down below

  // decide and implement arm
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

  let maybeDieIfTooOld = dontdie;
  if (killafter) {
    maybeDieIfTooOld = yesdie;
  }

  // on upgrade?
  // (no special code)


  // standard sequence - a la a unit test
  let setupOrRevive;

  if (experiment.isSetup()) {  //i.e., was it *ever* configured.
    setupOrRevive = resolve(experiment.revive());
  } else {
    setupOrRevive = experiment.firstStartup(armnumber);  // first time only
  }

  let runIfNotAlreadyRan = function () {
    if (experiment.ran()) {
      console.log("already ran");  // nothing more to do.
      resolve(true);
    } else {
      console.log("will run");
      return experiment.everyRun();
    }
  };

  let maybeOverrideLateEnough = function () {
    if (options.lateenough) {
      console.log("want to override lateenough");
      emit(experiment.observer, "lateenough");  //sets pref by side effect
    }
  };

  setupOrRevive.then(   // all side effects.
  maybeDieIfTooOld).then(  // if needed
  maybeOverrideLateEnough).then(  // because setup() resets(), so has to come after
  runIfNotAlreadyRan).then(   // - run if not ran
    null,
    console.error // all errors;
  );

  // - teardown
  // (no teardown)
};


// on unload? -- nothing to do?  Should we clear prefs?


exports.onUnload = function (reason) {
  if ((reason === "disable") || reason === "uninstall") {
    experiment.reset();
  }
};



