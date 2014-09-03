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


/*

Doorhanger, with questions.

Sends on "send"?
sends on doorhanger close?
Sends on event change

*/

const chrome = require("chrome");
const data = require("sdk/self").data;
const {Panel} = require("sdk/panel");

const { phonehome }  = require("phonehome");

let msgPanel = Panel({
  width: 400 + 2,
  height: 240 + 3,
  contentURL: data.url('fivestar.html'),
  //contentURL: data.url('ui/doorhanger.html'),
  contentScriptFile: data.url('worker/doorhanger.js'),
  onShow: function () {
  },
  onHide: function () {
    //show();
  }
});

msgPanel.port.on("message", function (data) {
	switch (data.what) {
		case "phonehome":
			phonehome();
			break;
		default:
			console.log("unknown message from wrapped page");

	}
})


let anchor = function () {
  var wm = chrome.Cc["@mozilla.org/appshell/window-mediator;1"]
                     .getService(chrome.Ci.nsIWindowMediator);
  var win = wm.getMostRecentWindow("navigator:browser");
  return win.document.getElementById("PanelUI-button");
  // TODO fallback for various things.
}

let show = function () {
  msgPanel.show({}, anchor());
};


var { Hotkey } = require("sdk/hotkeys");

var showHotKey = Hotkey({
  combo: "accel-shift-o",
  onPress: function() {
    show();
  }
});


exports.show = show;
