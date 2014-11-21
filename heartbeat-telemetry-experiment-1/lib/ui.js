/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global exports, console */

"use strict";
const { data } = require("sdk/self");
const { extend } = require("sdk/util/object");
const tabs = require("sdk/tabs");

const dh = require("ui/doorhanger");
const notification = require("ui/notification");
const { anchor } = require("ui/anchor");

const { phonehome } = require("phonehome");
const uiutils = require("ui/ui-utils");

const {makeNotice} = require("ui/question-bars");

/** Arm WidgetFactory objects
  *
  * Specificaion:
  *   Arguments
  *     Q:  the question configuration
  *     flowid: which particular flowid
  *
  **/

/**
  *
  *  overrides:
  *
  *  returns:
  *    WidgetFactory
  *
  *  needs to handle vote and page open!
  *
  */
let metanotification = function (overrides) {
  let {which} = overrides;

  /* Q, flowid, per WidgetFactory above */
  let fn = (Q, flowid) => {
    console.log(Q, flowid);
    let opts = extend({}, Q, {mikestyle: true});
    // makeNotice(which, flowid, bartype, overrides).
    return makeNotice(Q.qtype, flowid, overrides.bartype, opts);
    // make banner
    //let P = notification.banner({
    //  msg: Q.question,
    //  id: null,
    //  icon: "chrome://global/skin/icons/question-large.png",
    //  priority: null,
    //  buttons: buttons,
    //  callback: function () {  // cb on close!
    //      let info = extend({},
    //        Q,
    //        {
    //          flowid: flowid,
    //          msg: 'flow-ui-closed'
    //        });
    //      phonehome(info);
    //  },
    //  nb: nb
    //});
  };
  return fn;
};

// actual ui's as seen by the arms
exports.notification_top_global = (Q, flowid) => {
  return (metanotification({
    bartype: "top-global",
  })(Q, flowid));
};

exports.notification_bottom_global = (Q, flowid) => {
  return (metanotification({
    bartype: "bottom-global",
  })(Q, flowid));
};
