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
const { data } = require("sdk/self");
const { extend } = require("sdk/util/object");
const tabs = require("sdk/tabs");

const dh = require("ui/doorhanger");
const notification = require("ui/notification");
const { anchor } = require("ui/anchor");

const { phonehome } = require("phonehome");
const utils = require("utils");
const uiutils = require("ui/ui-utils");

/** Factories for use with 'arms'
  */


console.log("ui overall library");

let fake = () => {};

// curry the few variable things
let metapanel = function(overrides) {
  // the args to curry
  let {width, height, anchor_fn} = overrides;

  // the factory
  let fn = function(Q, flowid) {
    Q = Q || {};
    let cto = extend(
      {},
      dh.defaultSctiptOptions,
      Q,
      {flowid: flowid}
    );
    console.log("about to fire panel");

    let P = dh.msgPanel({
      width: width,   //
      height: height, //
      contentScriptOptions: cto,
      onHide: function () {
        phonehome({flowid: flowid, msg: "flow-ui-closed"});
      }
    });
    return {
      widget: P,
      go: () => P.show({}, anchor_fn())
    };
  };
  return fn;
};

// needs to handle vote and page open!
let metanotification = function (overrides) {
  let isBottom  = overrides.bottom == true;
  console.log("is bottom?", isBottom);
  let fn = (Q, flowid) => {
    // make buttons.
    let buttons= [];
    for (let ii=1; ii <= Q.outof; ii++) {
      let b = notification.nbButtons[ii]({
        callback: function(nb, b) {
          console.log('nb rated', ii);
          let info = extend({},
            Q,
            {
              rating: ii,
              flowid: flowid,
              msg: 'flow-ui-closed'
            });
          phonehome(info);
          uiutils.openAfterPage(info);
        }
      });
      buttons.push(b);
    }

    let bad_msg = "no thanks";
    buttons.push(notification.nbButtons[bad_msg]({
      callback: function(nb, b) {
        console.log(bad_msg);
        let info = extend({},
          Q,
          {
            flowid: flowid,
            msg: 'flow-ui-refused'
          });
        phonehome(info);
      }
    }));

    let nb = notification.notificationbox(null,isBottom); // bottom!
    // make banner
    let P = notification.banner({
      msg: Q.question,
      id: null,
      icon: null, //"chrome://global/skin/icons/question-large.png",
      priority: null,
      buttons: buttons,
      callback: null,
      nb: nb
    });

    return {
      widget: P,
      go: () => {} // empty!
    };
  };
  return fn;
};



// actual ui's as seen by the arms

exports.panel_big = (Q, flowid) => {
  return (metapanel({
    width: 600,
    height: 400,
    anchor_fn: anchor
  })(Q, flowid));
};

exports.panel_small = (Q, flowid) => {
  return (metapanel({
    width: 450,
    height: 300,
    anchor_fn: anchor
  })(Q, flowid));
};

exports.panel_big_unanchored = (Q, flowid) => {
  return (metapanel({
    width: 600,
    height: 400,
    anchor_fn: function() {return null;}
  })(Q, flowid));
};

exports.notification_top = (Q, flowid) => {
  return (metanotification({
    bottom: false,
  })(Q, flowid));
};

exports.notification_bottom = (Q, flowid) => {
  return (metanotification({
    bottom: true,
  })(Q, flowid));
};

exports.background_tab = (Q, flowid) => {
  Q = Q || {};
  let cto = extend(
    {},
    dh.defaultSctiptOptions,
    Q,
    {flowid: flowid}
  );
  let P = dh.questionAsPage(cto);
  return ({
    widget: P,
    go: function () {
      tabs.open({
        url:data.url("question.html"),
        inBackground: true,
      });
    }
  });
};


exports.about_newtab_mod = fake;


// interruption contexts.
