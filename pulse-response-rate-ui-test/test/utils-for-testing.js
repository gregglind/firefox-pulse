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

const tabs = require("sdk/tabs");
const browserWindows = require("sdk/windows").browserWindows;

const timers = require("sdk/timers");

/**
  */
let wait = exports.wait = function (ms) {
  let { promise, resolve } = defer();
  timers.setTimeout(resolve, ms);
  return promise;
};

let waitasec = exports.waitasec = function(){
  let { resolve } = defer();
  return wait(1000).then(resolve);
};


/** Get down to at most 1 window with at most 1 tab
  *
  * resolves: true that condition is first reached
  */
let tabs1_windows1 = exports.tabs1_windows1 = function () {
  let { promise, resolve } = defer();
  let closeOrResolve = function () {
    if (browserWindows.length > 1) {
      //console.log("closing a window");
      browserWindows[1].close(closeOrResolve);
    } else {
      if (tabs.length > 1) {
        //console.log("closing a tab");
        tabs[1].close(closeOrResolve);
      } else {
        console.log("number of tabs = ", tabs.length);
        resolve(true);
      }
    }
  };
  closeOrResolve();
  return promise;
};

exports.doneclean = function doneclean (done_fn) {
  return function () {tabs1_windows1().then(done_fn)};
};

