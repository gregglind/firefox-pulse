/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global */

"use strict";

const tabs = require("sdk/tabs");
const self = require("sdk/self");

const utils = require("utils");
const afterpage = require("./after-page");

exports.openAfterPage = function (data) {
  // eegh, how to get the page mode open with the right stuff?
  utils.wait(500).then(() => {
    // make the pageMod with OUR data.  Risk that
    let P = afterpage.factory(data);
    tabs.open({
      url: self.data.url("after.html"),
      inBackground: true
    });
  }).then(
    null,
    console.error
  );
};


// open or reopen a tab, based on url.
/** options will only be used in the case of a new tab.  if the tab exists,
  * it will just activate it
  */
exports.switchtab = function(options) {
    var url = options.url || options;  // tabs.open takes both
    if (! options) options = {};
    for (let ii in tabs) {
        let tab = tabs[ii];
        if (tab.url == url) {
            tab.activate();
            return tab;
        }
    }
    return tabs.open(options);
};
