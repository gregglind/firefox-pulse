/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require */

"use strict";


var {Cc, Ci} = require("chrome");
var data = require("sdk/self").data;

var sss = Cc["@mozilla.org/content/style-sheet-service;1"]
             .getService(Ci.nsIStyleSheetService);
var ios = Cc["@mozilla.org/network/io-service;1"]
             .getService(Ci.nsIIOService);


exports.register = function register(aURL) {
  if(!isRegistered(aURL))
    sss.loadAndRegisterSheet(aURL, sss.USER_SHEET);

  require("sdk/system/unload").when(function() {
    if(isRegistered(aURL))
      sss.unregisterSheet(aURL, sss.USER_SHEET);
  });
};

exports.unregister = function unregister(aURL) {
  if(isRegistered(aURL)) {
    sss.unregisterSheet(aURL, sss.USER_SHEET);
  }
};

function isRegistered(aURL) {
  return sss.sheetRegistered(aURL, sss.USER_SHEET);
}

exports.getURI = function getURL(uri) {
  return ios.newURI(data.url(uri), null, null);
}

