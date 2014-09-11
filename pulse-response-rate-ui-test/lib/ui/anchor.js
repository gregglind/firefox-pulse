/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */


"use strict";

const chrome = require("chrome");

/** search through elIds until and existing one is found
  *
  * elIds:  [id_strings or DOMElement + ]
  */
let anchor = exports.anchor = function (elIds) {
  var wm = chrome.Cc["@mozilla.org/appshell/window-mediator;1"]
                     .getService(chrome.Ci.nsIWindowMediator);
  var win = wm.getMostRecentWindow("navigator:browser");
  elIds = elIds || ["PanelUI-menu-button", "home-button", "urlbar"]; // hamburger button

  for (let ii = 0; ii < elIds.length; ii++) {
    let guess = elIds[ii];
    let el;
    console.log(guess);
    if (typeof(guess) === "string") {
      el = win.document.getElementById(guess);
    } else {  // TODO, this should typecheck against elements, then throw?
      el = guess;
    }
    if (el) return el;
  }
};
