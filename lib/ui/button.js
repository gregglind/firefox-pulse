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


const {ToggleButton} = require("sdk/ui/button/toggle");
const {ActionButton} = require("sdk/ui/button/action");

const tabs = require("sdk/tabs");
const self = require("sdk/self");



ActionButton({
	id: "panel-button",
	label: "Firefox Love",
	icon: {
		"16": "./ui/icons/mozlove.png",
		"32": "./ui/icons/mozlove.png",
		"64": "./ui/icons/mozlove.png"
	},
	onClick: function () {tabs.open(self.data.url("ui/myfirefox.html"));}
	// onChange: buttonChange
});


/* 

:11 < gregglind> is there a nice way for a ui button to only appear when it's needed?
08:11 < gregglind> And otherwise hide / not exist?
08:13 <@ZER0> gregglind, no, that was explicitly prohibited by UX to avoid "jumper" effect in the toolbar
08:13 < gregglind> Noted.
08:13 < gregglind> Thanks!
*/



