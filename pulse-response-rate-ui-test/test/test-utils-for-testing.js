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

const utils = require("./utils-for-testing");

const tabs = require("sdk/tabs");

const promises = require("sdk/core/promise");
const { defer, resolve } = promises;

const { extend } = require("sdk/util/object");

// https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/tabs#open%28options%29
let opentab = function (options) {
  let { promise, resolve } = defer();
  options = options || {};

  if (options.onOpen) {
    throw Error("opentab options can't have onOpen, or promise won't resolve.");
  }
  let newopts = extend({
    url: "about:blank",
    onOpen: function onOpen(tab) {
      resolve(true);
    }
  }, options);
  console.log("opening page", newopts.url, "new window?", newopts.inNewWindow);
  tabs.open(newopts);
  return promise;
};

exports["test tabs1_windows1"] = function (assert, done) {
  resolve(true).then(
  () => opentab()).then(
  () => opentab({inNewWindow: true})).then(
  () => opentab({inNewWindow: true})).then(
  () => opentab()).then(
  () => assert.equal(tabs.length, 5, "5 tabs as expected")).then(
  utils.tabs1_windows1).then(
  () => {
    assert.pass("tabs1_windows1 works");
    assert.ok(tabs.length <= 1, "at most 1 tab");
    done();
  }
  );
};


require("sdk/test").run(exports);

