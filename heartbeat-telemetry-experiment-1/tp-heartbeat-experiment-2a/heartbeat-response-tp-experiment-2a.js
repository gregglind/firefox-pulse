/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, moz: true */

/*global */

var BaseClasses = require("study_base_classes.js");

// Configure throttling
const LOCALE_REGEX = "en";  // en only

const SLUG = "heartbeat-response-tp-experiment-2a";
const RANDOM_DEPLOY_PREFIX = "extensions.testpilot.deploymentRandomizer";
const RANDOM = "pulse-research";
// Configure the Installer
const ADDON_ID = "heartbeat-telemetry-experiment-1@mozilla.com"; // from package.json
const ADDON_URL = "https://testpilot.mozillalabs.com/addons/"+SLUG+".xpi"; // --output-file //CHANGE TO PROPER HOST

const ALLOWED_CHANNELS = ["aurora", "nightly"];

let modules = {};
Cu.import("resource://gre/modules/AddonManager.jsm", modules);
Cu.import("resource://gre/modules/Services.jsm", modules);
let {AddonManager, Services} = modules;

exports.experimentInfo = {
  testId: SLUG,
  testName: "Heartbeat Response Rate UI Test",
  testInfoUrl: "https://testpilot.mozillalabs.com/testcases/"+SLUG+"/README.html", //CHANGE TO INFO PAGE
  summary: "UI Variations for Collecting Feedback",
  versionNumber: 1,
  duration: 110, //CHANGE TO NUMBER OF DESIRED DAYS
  minTPVersion: "1.2.3",
  minFXVersion: "34.0",  // not 34 beta
  optInRequired: false,

  randomDeployment: {
    minRoll: 41,
    maxRoll: 60,
    rolloutCode: RANDOM,  // reuse previous code
  },

  runOrNotFunc: function () {
    // Only run if there's no other study running
    if (studyMutex.checkConflicted(ADDON_ID)) {
      return false;
    }

    // Target appropriate locale
    let locale = Services.prefs.getCharPref("general.useragent.locale");
    if (!new RegExp("^" + LOCALE_REGEX, "i").test(locale)) {
      return false;
    }

    let rd = Services.prefs.getCharPref(RANDOM_DEPLOY_PREFIX + '.' + RANDOM);
    dump("random deploy is: " + 1 * rd + "\n");
    dump("locale is: " + locale + '\n' );

    let channel = Services.prefs.getCharPref("app.update.channel");
    if (ALLOWED_CHANNELS.length) {
      if (ALLOWED_CHANNELS.indexOf(channel) < 0) {
        return false;  // bad channel!
      }
    }
    // Must be good to run
    return true;
  },

  // Wrap runOrNotFunc for newer versions of Test Pilot
  filter: function (cb) {
    cb(exports.experimentInfo.runOrNotFunc());
  },
};

// Prepare to check and claim the study mutex
let studyMutex = new BaseClasses.CurrentStudyMutex(ADDON_ID);

// Define a data store as empty as possible
exports.dataStoreInfo = {
  fileName: "testpilot_" + exports.experimentInfo.testId + "_empty.sqlite",
  tableName: "empty",
  columns: [{
    property: "empty",
    type: BaseClasses.TYPE_STRING,
    displayName: "empty"
  }]
};

// Define a handler that just installs an add-on
function Installer() Installer.baseConstructor.call(this, null)
BaseClasses.extend(Installer, BaseClasses.GenericGlobalObserver);
exports.handlers = new Installer();
Installer.prototype.onExperimentStartup = function (store) {
  Installer.superClass.onExperimentStartup.call(this, store);

  // Claim the current study
  studyMutex.claimExclusive(ADDON_ID);

  // Don't use BaseClasses.AddonController, which has different
  // assumptions!
  AddonManager.getAllAddons(function (addons) {
    let installed = false;
    addons.forEach(function ({id}) {
      // Remember that it was already installed
      if (id === ADDON_ID) installed = true;
    });
    if (!installed) {
      AddonManager.getInstallForURL(ADDON_URL, function (install) {
        install.install();
      }, "application/x-xpinstall");
    }
  });
};

// Define an empty web content as there's no data to show
function NoData() NoData.baseConstructor.call(this, exports.experimentInfo)
BaseClasses.extend(NoData, BaseClasses.GenericWebContent);
NoData.prototype.__defineGetter__("dataCanvas", function () "");
exports.webContent = new NoData();
