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

Firefox PULSE


OCCASSIONALLY,
ask people how firefox is going?

https://github.com/bwinton/SnoozeTabs/blob/master/lib/main.js#L53

https://bugzilla.mozilla.org/show_bug.cgi?id=878877

*/

let UI = require("ui/ui.js");

console.log("starting");

UI.show();

require("startup");

//require("sdk/tabs").open(data.url("message1.html"))

console.log("done");