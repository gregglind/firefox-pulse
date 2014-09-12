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
const { Panel } = require("sdk/panel");
const { extend } = require("sdk/util/object");
const tabs = require("sdk/tabs");

const { phonehome }  = require("phonehome");

const utils = require("utils");
const uiutils = require("ui/ui-utils");

let dh = require("./doorhanger");
/// for working on this as a page.
const pageMod = require("sdk/page-mod");

let questionOnNewTab = exports.questionOnNewTab = (cso) => {
  let these = {
    //include: /.*\/question.html$/,
    include: /"about:newtab"/,
    onAttach: function(worker) {
      worker.port.on("close", function () {
        console.log("got close");
        utils.wait(200).then(() => {
          worker.tab.close();
        });
      });
      worker.port.on("open-afterpage", function () {
        console.log("got open-afterpage");
        uiutils.openAfterPage();
      });
      worker.port.on("rate", function (info) {
        console.log("got a rating, should phone home");
        phonehome(info);
      });
      worker.port.on("refuse", function (info) {
        console.log("got a rating, should phone home");
        info = extend({},info,{msg:"flow-ux-refused"});
        phonehome(info);
      });
    }
  };
  // cso will have Q, flowid, etc
  let options = extend({}, dh.panelDefaults, these, cso);
  let P = pageMod.PageMod(options);
  return P;
};



/*
var $ = document.querySelector;

var parent = $("#newtab-margin-top”);
parent.style({
  "-moz-box-flex": “1"
  "-moz-box-align": “center"
  "-moz-orient": "vertical",
  "-moz-box-pack": “centre"
});
$(“<div>how do you feel about fx  + + + + +</div>”).prependTo(parent).style({
  “font”: “message-box”,
  "font-size": “13px”,
  "padding-top": "1em"
});

*/

