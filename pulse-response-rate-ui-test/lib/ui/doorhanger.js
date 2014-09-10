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

//const { phonehome }  = require("phonehome");


// args:  size, message
/**

  known options:
    width:
    height:

  More: https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/panel
*/
let msgPanel = exports.msgPanel = function (options) {
  let defaults = {
      width: 200 + 3,
      height: 240 + 3,
      //contentURL: data.url('fivestar.html'),
      contentURL: data.url('doorhanger.html'),
      contentScriptFile: data.url('worker/doorhanger.js'),
      contentScriptOptions: {
        questionText: "Please Rate Firefox",
        numstars: 5
        // afterUrl: "some/url"
      },
      onShow: function () {
        // phone?  or not?
      },
      onHide: function () {
      }
  };
  options = extend(defaults, options);

  return Panel(options)
};

// args:  size, message


