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

console.log(require("sdk/self").data.url());
//require("sdk/tabs").open(require("sdk/self").data.url("fivestar.html"));


// read in cli stuff?

let { staticArgs } = require("sdk/system");


let processStaticArgs = exports.processStaticArgs = function (statics) {
	// do your worst!
	if (statics === undefined) {
		statics = statics || {};  // none!
	}
};





