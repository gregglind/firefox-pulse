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
const myprefs = require("sdk/simple-prefs").prefs;

const { EventTarget } = require("sdk/event/target");
let { emit } = require('sdk/event/core');

let triggers = require("triggers");
let arms = require("arms");

const { uu } = require("./utils");

/**
  Assumptions...

  - on this, we can't serialize whole state,
  - we can serial recall cues (number, name)
*/

// module vars
let myarm;


/** Observer of various interesting events, useful for tests.
  *  - set-arm (armnumber);
  *  - flow (armnumber)
  */
let observer = exports.observer = EventTarget();

observer.on("ran", function () {
  myprefs.ran = true;
});

let rememberArm = function (data) {
  myarm = data;
  myprefs.armnumber = data.number;
  myprefs.armname = data.name;
  // other stuff on history, arm stuff?
};

let revive = exports.revive = function () {
  let armnumber = myprefs.armnumber;
  setupArm(armnumber);
}

/* useful in cases where we know the armno, but not the armdata */
let setupArm = exports.setupArm = function (armnumber) {
  let arm = myarm = arms.chooseArm(armnumber);
  rememberArm(arm);
  emit(observer, "set-arm", armnumber);
};

/** is the experiment setup?
  *
  */
let isSetup = exports.isSetup = function () {
  return myprefs.configured === true;
};

let firstrunts = exports.firstrunts = function () {
  return Number(myprefs.firstrunts, 10);
};

let ran = exports.ran = function () {
  return myprefs.ran;
};

let firstStartup = exports.firstStartup = function (armnumber) {
  let {promise, resolve} = defer();
  reset();

  //setup
  myprefs.firstrunts = "" + Date.now();
  myprefs.person = uu();
  setupArm(armnumber); // here, random, sets some prefs and module var
  myprefs.configured = true;
  resolve();
  return promise;
};

let everyRun = exports.everyRun = function () {
  let {promise, resolve, reject} = defer();
  console.log("arm:", myarm.number, myarm.name);
  if (myarm.number === undefined) {
    reject("everRun:  Arm number undefined");
  }
  setupArm(myarm.number);
  myarm.flow();  // do it!
  emit(observer, "flow" , myarm.armnumber);
  // rememberArm()? -> to pref?
  resolve();
  return promise;
};


let reset = exports.reset = function () {
  for (let k in myprefs) {
    delete myprefs[k];
  }
};

let changeArm = exports.changeArm = function (armnumber) {
  triggers.reset();
  setupArm(armnumber); // assign
};
