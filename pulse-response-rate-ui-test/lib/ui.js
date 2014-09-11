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

const dh = require("ui/doorhanger");
const notification = require("ui/notification");

/* are these factories for the ui el's? */

console.log("ui overall library");

let fake = () => {};

exports.panel_big = () => {
  console.log("about to fire panel");
  return dh.msgPanel({
    width: 500,
    height: 500
  });
};

exports.panel_small = fake;

exports.panel_big_unanchored = fake;

exports.notification_top = fake;

exports.notification_bottom = fake;

exports.background_tab = fake;

exports.about_newtab_mod = fake;


// interruption contexts.
