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
const { defer } = promises;

const timers = require("sdk/timers");
const uuid = require("sdk/util/uuid");
const apiUtils = require("sdk/deprecated/api-utils");
const { extend } = require("sdk/util/object");

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


/** like validateOptions, but 'extra' keys are allowed */
let validateWithOptional = exports.validateWithOptional = function (options, rules) {
  return extend({}, options, apiUtils.validateOptions(options,rules));
};


/* randint in [l, r).   If r is undefined, then [0, r-1) */
let randint = exports.randint = function(l, r) {
  if (r === undefined) {
    r = l;
    l = 0;
  }
  return Math.floor(l + (Math.random() * (r-l)));
};


/** day of year 0-365, leap aware
  * ts:  something new Date(ts)-able
  */
exports.dayofyear = function (ts) {
  var now = ts ? new Date(ts): new Date() ;
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = now - start;
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);
  return day;
};

