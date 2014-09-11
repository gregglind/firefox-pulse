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

//const chrome = require("chrome");
const data = require("sdk/self").data;
const { Panel } = require("sdk/panel");
const { extend } = require("sdk/util/object");
const tabs = require("sdk/tabs");

const { phonehome }  = require("phonehome");

const utils = require("utils");

// args:  size, message
/**

  known options:
    width:
    height:

  More: https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/panel
*/

let defaultSctiptOptions = exports.defaultSctiptOptions = {
  symbolUnlit: "☆",
  symbolLit: "★",
  outof: 5,
  afterUrl: "after.html",
  question:  "Rate Firefox"
};


let panelDefaults = {
    width: 400 + 3,
    height: 500 + 3,
    //contentURL: data.url('fivestar.html'),
    contentURL: data.url('question.html'),
    contentScriptFile: data.url('packed-question.js'),
    contentScriptOptions: defaultSctiptOptions,
    onShow: function () {
      // phone?  or not?
    },
    onHide: function () {
    }
};

let msgPanel = exports.msgPanel = function (options) {
  options = extend({}, panelDefaults, options);
  let P = Panel(options);
  // set up some pre-mapped things.
  P.port.on("close", function () {
    console.log("got close");
    utils.wait(200).then(() => {
      P.hide();
      P.destroy();
    })

  });
  P.port.on("open-afterpage", function () {
    console.log("got open-afterpage");
    tabs.open({
      url: data.url("after.html"),
      inBackground: true
    });
  });
  P.port.on("rate", function (info) {
    console.log("got a rating, should phone home");
    phonehome(info);
  });

  return P;
};

// args:  size, message


/// for working on this as a page.
const pageMod = require("sdk/page-mod");
let dhAsPage = () => {
  let these = {
    //include: /.*\/question.html$/,
    include: data.url("question.html"),
    onAttach: function(worker) {
      worker.port.on("close", function () {
        console.log("got close");
        utils.wait(200).then(() => {
          //P.hide();
          //P.destroy();
        });
      });
      worker.port.on("open-afterpage", function () {
        console.log("got open-afterpage");
        tabs.open({
          url: data.url("after.html"),
          inBackground: true
        });
      });
      worker.port.on("rate", function (info) {
        console.log("got a rating, should phone home");
        phonehome(info);
      });



      ["close", "open-afterpage", "rate"].forEach((k) => {
        worker.port.on(k, function (d) {
          console.log("dh", k, d);
        });
      });
    }
  };
  let options = extend({}, panelDefaults, these);
  pageMod.PageMod(options);
};

dhAsPage();
