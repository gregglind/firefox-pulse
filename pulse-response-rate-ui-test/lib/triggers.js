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

const tabs = require("sdk/tabs");

const { on, once, off, emit } = require('sdk/event/core');

const timers = require("sdk/timers");

// map or list to store them all?
let undo = [];

let reset = exports.reset = function () {
  // TODO, improve by taking any that return promises and waiting.
  // not sure how this should work.
  console.log("clearing!");
  undo.forEach(function (k, i) {
    console.log('undoing', i);
    //console.log(k.slice(2));
    (k[0]).apply(k[1], k.slice(2));
  });
};

/** Triggers have the same 'feel'.
  *
  * Args:
  *   consequence_fn: callback. what happens after completion.
  *     (todo: should these take args?)
  *   extra args: specific to each.
  *
  * Returns:  unclear
  */


//
let tabObs = require('sdk/tabs/observer').observer;

let newtab = exports.newtab = function (consequence_fn) {
  console.log("making consequence_fn");

  // to get around..
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1064494
  // https://github.com/mozilla/addon-sdk/blob/master/lib/sdk/deprecated/events.js#L56-L61
  let selfRemoving = function selfRemoving () {
    tabObs.removeListener("open", selfRemoving);
    consequence_fn.apply(tabObs, arguments); // actually do it!
  };

  tabObs.on("open", selfRemoving); // really, it's a 'once'
  console.log("48", tabObs._listeners("open").map((x) => console.log(x.toSource())));

  let args = [tabObs.removeListener, tabObs, 'open', selfRemoving];
  //console.log(args.map((x)=>typeof x));
  //console.log('49', args);
  undo.push(args);
  //console.log('51',undo);
};

/** 'wait a bit' triggers */
let after_a_while = exports.after_a_while = function (consequence_fn, delay_ms) {
  // setup
  let t = timers.setTimeout(consequence_fn, delay_ms);

  // undo
  let args = [timers.clearTimeout, timers, t];
  undo.push(args);
};

