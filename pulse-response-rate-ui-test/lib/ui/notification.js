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

const chrome = require("chrome");
const { emit, on, once, off } = require('sdk/event/core');
const { EventTarget } = require('sdk/event/target');
const tabs = require("sdk/tabs");
const timers = require("sdk/timers");
const { validateOptions: valid } = require("sdk/deprecated/api-utils");
const windowUtils = require("sdk/window/utils");
const { getMostRecentBrowserWindow } = windowUtils;
const {uuid} = require('sdk/util/uuid')
var { Class, mix } = require('sdk/core/heritage');


const validNumber = { is: ['number', 'undefined', 'null'] };




// https://developer.mozilla.org/en/XUL/notificationbox#Notification_box_events
// bottom:  http://mxr.mozilla.org/mozilla-central/source/browser/base/content/browser-data-submission-info-bar.js
/** expose the notification box (banner) for a window */
var notificationbox = exports.notificationbox = function (w, bottom){
  // TODO, this is SO MESSED UP.  GRL doesn't get xul vs most
  // recent vs whatever.
  w = w || getMostRecentBrowserWindow();
  //let thistab = w.gBrowser.mCurrrentBrowser; // undefined?
  if (bottom) {
    w = w || getMostRecentBrowserWindow();
    let nb = w.gDataNotificationInfoBar._notificationBox;
    console.log(nb);
    return nb;
  } else {
    var wm = chrome.Cc["@mozilla.org/appshell/window-mediator;1"]
                     .getService(chrome.Ci.nsIWindowMediator);
    var win = wm.getMostRecentWindow("navigator:browser");
    //return win.document.getElementById("global-notificationbox"); // bottom
    let nb = win.document.getElementById("high-priority-global-notificationbox");
    if (nb) return nb // 33+?
    else {
      return win.gBrowser.getNotificationBox();
    }
  }
};

/* callback should register on AlertShow, AlertClose, TODO!

    see:  aboutRights; telemetry notifications (good examples) live at:
    at http://mxr.mozilla.org/mozilla-central/source/browser/components/nsBrowserGlue.js

    TODO... hideclose?

    Note:  in desktop fx, there is no event fired on close.  We fake this.
*/
var banner = exports.banner =  Class({
  extends:  EventTarget,
  initialize: function initialize(options) {
    let defaults =  {
      onKill:  function (data) {
        let note = this.nb.getNotificationWithValue(this.id);
        this.nb.removeNotification( this.notice );
        emit(this,"AlertKilled", note);
      },
      onSoftkill:  function (data) {
        let note = this.nb.getNotificationWithValue(this.id);
        this.nb.removeNotification(this.notice);
        emit(this,"AlertSoftKilled", note);
      },
    };
    EventTarget.prototype.initialize.call(this,defaults);

    let { msg, id, icon, priority, buttons, callback, nb} = options;
    if (! buttons) buttons = [];
    if (! id) id =  "banner_" + uuid();
    if (! icon) icon = null; //'chrome://browser/skin/Info.png';
    if (nb) {
      this.nb = nb;
    } else {
      this.nb = notificationbox();
    }
    if ((typeof priority) === "string") {
        priority = nb[priority] || 1;  // TODO, throw here?
    } else {
        if (! priority) priority = 1;
    }

    // our AlertClose
    let that = this;
    if (callback === undefined) {
      callback = function(message) {
        if (message === "removed") {
            emit(that,'AlertClose',that.notice);
        }
        return false;
      };
    }
    this.notice = this.nb.appendNotification(msg, id, icon,
        priority, buttons, callback);
  },
  type: 'Banner'
});


/*
    notification box buttons with standard names.

    TODO... allow for translations... browserBundle.GetStringFromName

    buttons just get a label, not an image, alas!

    Example of usage:

        banner({msg:"I want to do something", buttons=[nbButtons.yes(
            {callback: function(nb,b) {doSomethingInAddonScope()})
            ]
        })

    Don't like the default labels?  Override them!

        banner({msg:"if you want this...", buttons=[nbButtons.yes(
            {label: "click here"})
            ]
        })

    Or:

        banner({msg: "want to", buttons=[nbButtons['click here?']()]});

*/
let nbButtons = exports.nbButtons = {
};


['yes','no','more','cancel','always','never','details'].forEach(
  function(label){
    let defaults = {
      label:     label,
      accessKey: null,
      popup:     null,
      callback:  function(aNotificationBar, aButton) {
        // TODO, a sensible default action?  maybe observer emit?
      }
    };
    let f = function(options) {
      if (!options) options = {};
      return mix(defaults,options); // TODO, sorry this is gross!
    };
    nbButtons[label] = f;
});

// this is gross... https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/NoSuchMethod
// but generates buttons with odd labels.  Only on *call* though!
nbButtons.__noSuchMethod__ = function(method, args) {
  let newargs = mix({"label": method},args[0]);
  return this['yes'](newargs);
};


