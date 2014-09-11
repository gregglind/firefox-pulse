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

const promises = require("sdk/core/promise");
const { defer, resolve } = promises;


require("./ui/uitest");

let main = exports.main = function (options, callback) {
  console.log("running");
  // args
  let options = options.staticArgs || {};

  if (options.self) {
    require("sdk/tabs").open(self.data.url(""));
    require("sdk/tabs").open(self.data.url("uitest.html"));
    require("sdk/tabs").open(self.data.url("question.html"));

  }
  // special options modes
    // reset:  bool
    // armnumber:  int
    // (various urls?)
    // debug: bool
    // phonehome:  bool

  // upgrades
  //

  // standard sequence - a la a unit test
  experiment.firstStartup().then(   // all side effects.
  experiment.everyRun).then(   // - run
  //resolve(() => console.log('running'))
  ).then(  // what is this one?
    null,
    console.error // all errors;
  );

  // - teardown
};

// teardown



