/*! vim:set ts=2 sw=2 sts=2 expandtab */
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


/**! Metadata about this module. */
exports.metadata = {
  "stability": "experimental",
  "engines": {
    "Firefox": "22",
    "Fennec": "22"
  }
};

/*!*/
const { Cu } = require("chrome");

const { defer } = require('sdk/core/promise');

const myprefs = require("sdk/simple-prefs").prefs;
const xa = require("sdk/system/xul-app");
const prefs = require('sdk/preferences/service');
const runtime = require('sdk/system/runtime');

/** log IFF `prefs.micropilot` is set.
 *
 * @return undefined
 * @name microlog
 */
let microlog = exports.microlog = function () {
  if (myprefs.micropilotlog) console.log.apply(null, arguments);
};


/** gather general user data, including addons, os, etc.
 *
 * Properties:  appname, location, fxVersion, os, updateChannel, addons list
 * @return promise promise of userdata
 * @name snoop
 * @memberOf main
 */
let snoop = exports.snoop = function () {
  let { promise, resolve } = defer();

  let LOCALE_PREF = "general.useragent.locale";
  let UPDATE_CHANNEL_PREF = "app.update.channel";

  let u = {};
  u.appname = xa.name;
  u.location = prefs.get(LOCALE_PREF);
  u.fxVersion = xa.version;
  u.os = runtime.os;
  u.updateChannel = prefs.get(UPDATE_CHANNEL_PREF);

  let { AddonManager } = Cu.import("resource://gre/modules/AddonManager.jsm");
  u.addons = [];
  AddonManager.getAllAddons(function (addonList) {
    Array.forEach(addonList, function (a) {
      let o = {};
      ['id', 'name', 'appDisabled', 'isActive', 'type', 'userDisabled'].forEach(function (k) {
        o[k] = a[k];
      });
      u.addons.push(o);
    });
    resolve(u);
  });
  return promise;
};


/** Self-destruct (uninstall) this addon
 *
 * @param {string} id addon id
 * @return promise (sdk/adddon/installer).uninstall
 * @memberOf main
 * @name killaddon
 */
let killaddon = exports.killaddon = function (id) {
  id = id === undefined ? require('sdk/self')
    .id : id;
  microlog("attempting to remove addon:", id);
  return require("sdk/addon/installer")
    .uninstall(id);
};
