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


const ui = require("ui");
const data = require("sdk/self").data;

const pageMod = require("sdk/page-mod");

let arms = require("arms");
let Q = require("arms").questions[0];
let flowid = 1234;

let P = pageMod.PageMod({
  include: data.url("ui-demo.html"),
  //include: /.*uitest.html/,
  contentScriptFile: data.url('packed-uitest.js'),
  contentScriptOptions: {
    ui: Object.keys(ui).sort(),
    questions:  arms.questions
  },
  onAttach: function(worker) {
    worker.port.on("ui", function (which, q) {
      console.log("which ui:", which, q);
      ui[which](q, flowid).go(); // like a fake arm
    });
  }
});

/** Quick page to test all ui
  *
  */
