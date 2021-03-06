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

let dh = require("./doorhanger");


exports.show = dh.show;


// some config or pref?
if (true) {
	let weTab = require("./watchedEscapableTab");
	weTab.pageModMixin({
		//include: self.data.url("ui/myfirefox.html")
		include: self.data.url("*")
	});
	require("./button");
	require("./selfhelp-pagemod");
}