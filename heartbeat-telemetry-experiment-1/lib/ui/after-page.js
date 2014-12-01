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

const data = require("sdk/self").data;
const { extend } = require("sdk/util/object");

const pageMod = require("sdk/page-mod");

const phonehome = require("phonehome");
const flow = require("flow");


let afterPageRe = exports.afterPageRe = /.*experiment1\/(happy|sad|neutral)\.html.*/
// https://input.allizom.org/static/hb/experiment1/happy.html

let factory = exports.factory = function (cso) {
  let P = pageMod.PageMod({
    include: afterPageRe,
    contentScriptFile: data.url('packed-after.js'),
    contentScriptOptions: cso,
    contentStyle: [],
    onAttach: function(worker) {
      console.log("ATTACHING factory");
      worker.port.on("link", function (link) {
        console.log("afterPage link clicked", link, cso.mood);
        // engage, set up after links.
        if (flow.current()) {
          flow.engaged(); // only first one!  flow.js protects us
          flow.link(link, cso.mood);
          flow.persist();
          phonehome.phonehome();
        }
      });
    },
    onDetach: function(worker) {
      P.destroy();
    }
  });
  return P;
};
