/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, console, exports */

"use strict";

const promises = require("sdk/core/promise");
const { defer } = promises;
const { extend } = require("sdk/util/object");

const genPrefs = require("sdk/preferences/service");

const FHR = require("./FHR");
const micropilot = require("micropilot-trimmed");

function getAddonVersion(){
  return require("sdk/self").version;
}

// parses the fhr 'data' object and calls the callback function when the result is ready.
// callback(profileAgeDays, sumMs)
// https://github.com/raymak/contextualfeaturerecommender/issues/136

function parseFHRpayload (data) {
  console.log("parsing FHR payload");

  var days = data.data.days;
  var nowDate = new Date();
  var todayDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 0, 0 ,0, 0);

  var aMonthAgoDate = new Date(todayDate.getTime() - 30 * 24 * 3600 * 1000);
  let sumMs = 0;
  var profileAgeDays = Date.now()/(86400*1000) - data.data.last["org.mozilla.profile.age"].profileCreation;

  let crashes = {
    total: 0,
    submitted: 0,
    pending: 0
  };

  for (var key in days){
    if (days.hasOwnProperty(key)){
      // crashes:
      let crash = days[key]["org.mozilla.crashes.crashes"];
      if (crash) {
        let p = crash.pending || 0;
        let s = crash.submitted || 0;
        crashes.total += p + s;
        crashes.pending += p;
        crashes.submitted += s;
      }

      var dateRegExp = new RegExp("(.*)-(.*)-(.*)");
      var allQs = dateRegExp.exec(key);
      let date = new Date(parseInt(allQs[1], 10), parseInt(allQs[2] - 1, 10), parseInt(allQs[3], 10), 0, 0, 0, 0);
      if (date >= aMonthAgoDate && date < todayDate) {
        if (days[key]["org.mozilla.appSessions.previous"]) {
          if (days[key]["org.mozilla.appSessions.previous"].cleanActiveTicks) {
            days[key]["org.mozilla.appSessions.previous"].cleanActiveTicks.forEach(function (elm) {
                sumMs = sumMs + elm * 5 * 1000;
            });
          }
        }
      }
    }
  }
  return {profileage: profileAgeDays, sumMs: sumMs, crashes: crashes};
}


function transformFhrData () {
  let {promise, resolve} = defer();
  console.log("starting to get FHR data");
  if (!FHR.reporter) resolve({});

  FHR.reporter.onInit().then(function() {
    return FHR.reporter.collectAndObtainJSONPayload(true);
  }).then(function(data) {
    resolve(parseFHRpayload(data));
  });
  return promise;
}

// alas, has to be async, stupid addons!
let getData = exports.getData = function () {
  let {promise, resolve} = defer();
  let d;

  let annotatePrefs = function () {
    d.prefs = {};
    [ "browser.search.defaultenginename",
      "privacy.donottrackheader.enabled",
      "privacy.donottrackheader.value",
      "places.history.enabled",
      "browser.tabs.remote",
      "browser.tabs.remote.autostart",
      "distribution.id",
      "gecko.buildID"
      ].forEach(function(k) {
        d.prefs[k] = genPrefs.get(k);
      });
  };

  micropilot.snoop().then(
  (data) => d = data).then(
  () => d.addonVersion = getAddonVersion()).then(
  transformFhrData).then(  // FHR, then transform it
  (transformed) => d = extend({},d,transformed)).then(
  annotatePrefs).then( // get some good prefs
  () =>resolve(d));

  return promise;
};
