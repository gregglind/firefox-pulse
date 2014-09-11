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
const { defer } = promises;

const timers = require("sdk/timers");
const uuid = require("sdk/util/uuid");

/** promised wait
  *
  * resolves empty after x ms.
  *
  * Note: unkillable, unlike normal timeout.
  */
let wait = exports.wait = function (ms) {
  let { promise, resolve } = defer();
  timers.setTimeout(resolve, ms);
  return promise;
};

/** uuid */
let uu = exports.uu = function () {
  return uuid.uuid().toString().slice(1,-1);
};
