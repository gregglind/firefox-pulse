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

const ui = require("ui");

//let arms = require("arms");
//console.log(Object.keys(arms));
//let Q = arms.questions[0];

let Q = {"rating": 3, "outof": 5, "question": "What?"};
let flowid = 1234;

let phonehome = require("phonehome");

let factory = exports.factory = function (cso) {
  cso = cso || extend({},Q, {flowid: flowid, rating: 3}); // fake
  let P = pageMod.PageMod({
    include: data.url("after.html"),
    //include: /.*uitest.html/,
    contentScriptFile: data.url('packed-after.js'),
    contentScriptOptions: cso,
    onAttach: function(worker) {
      worker.port.on("link", function (q) {
        console.log("afterPage link clicked", q);
        q.msg = "afterPage-link";
        phonehome.phonehome(q);
      });
    },
    onDetach: function(worker) {
      P.destroy();
    }
  });
  return P;
};
