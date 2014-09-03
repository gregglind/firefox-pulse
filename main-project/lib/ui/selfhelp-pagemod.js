/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, moz: true */

/*global */

"use strict";

let self = require("sdk/self");

const { PageMod } = require("sdk/page-mod");

// new experients...
var {getMostRecentBrowserWindow, isBrowser} = require("sdk/window/utils");

let highlight = function (selector, ms) {
  let document = getMostRecentBrowserWindow().document;
  let highlight = document.getElementById("UITourHighlightContainer");
  highlight.hidden = false;
  highlight.openPopup(document.querySelector(selector),
    "leftcenter topleft",  // leftcenter of el to topleft of panel
    0, // x offset
    -highlight.getBoundingClientRect().height/2); // y offset

  require("sdk/timers").setTimeout(()=>highlight.hidePopup(),ms||2000);
};

let unhighlight = function (highlight) {
  if (highlight === undefined) {
    let document = getMostRecentBrowserWindow().document;
    highlight = document.getElementById("UITourHighlightContainer");
  }
  highlight.hidePopup();
};


let selfHelpPageMod = PageMod({
  include: self.data.url("ui/myfirefox.html"),
  contentScriptFile: [
    self.data.url("thirdparty/jquery-2.1.0.min.js"),
    self.data.url("worker/selfhelp-highlight.js")
  ],
  //contentStyleFile:  self.data.url("worker/selfhelp.css"),
  onAttach: function onAttach(worker) {
    console.log(worker.tab.title, "attaching selfhelp-pagmod");
    worker.port.on("highlight", function(selector) {
      console.log("highlight", selector); 
      highlight(selector);
    });
    worker.port.on("unhighlight", function() {
      console.log("unhighlight"); 
      unhighlight();
    });
  }
});

console.log("selfhelp-pagmod done");