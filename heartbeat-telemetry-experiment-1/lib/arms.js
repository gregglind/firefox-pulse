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

// example randomization path.
//
// in this study...
// bottom v top
// stars+brusque vs stars+please vs nps
// the axes of experient here are :
// - top v bottom (ui)  (all persistent)
// - stars-direct "rate firefox", stars-polite "please rate firefox",  nps

/*
11:22 < gregglind> Cww: Heartbeat. I am now planning to make outpage randomization part of the epxeriment, to test our assumptions more about the score cutoffs.
11:22 < Cww> gregglind: is engagement going to OK a tweet this to low-scorers?
11:22 < Cww> (do we care?)
11:22 < gregglind> Good point.  Okay, I will think on it a bit.
11:23 < gregglind> Neutral / good might be safer
11:23 < gregglind> Okay, holding off until I think it through a bit more.

outro page...  smart vs random.
*/

const { emit } = require('sdk/event/core');
const promises = require("sdk/core/promise");
const { resolve } = promises;
const { extend } = require("sdk/util/object");


const { uu, randint } = require('utils');
const ui = require("./ui");
const triggers = require("./triggers");
const { phonehome } = require("./phonehome");  // this is a gross dep
const experiment = require("experiment");
const flow = require("flow");

const config = exports.config = {
  delay: 5*60*1000  /* 5 min */
};


let chooseArm = exports.chooseArm = function (rng, arms) {
  if (arms === undefined) arms = ARMS();
  if (rng === undefined) rng = randint(arms.length);
  let arm = arms[rng];
  arm.number = rng;
  return arm;
};

// widget, question, interruption, all combos

// interruptions take callbacks.
const interruptions = exports.interruptions = [
  {alias: 'after_a_while',
   fn:  (cb) => triggers.after_a_while(cb, config.delay)
  }
];

// question element parameters
const questions = exports.questions = [
  {
    qtype: "stars",
    msg: "Please Rate Firefox",
    alias: "stars-polite",
  },
  {
    qtype: "stars",
    msg: "Rate Firefox",
    alias: "stars-direct"
  },
  {
    qtype: "nps",
    msg: "How likely are you to recommend Firefox to others?",
    alias: "nps-standard"
  }
];


// take (question, flowid) as params.  UI widgets.
const widgets = exports.widgets = [
  {alias:'notification_top_global',
   fn:  (Q, flowid) => {
    return ui.notification_top_global(Q, flowid);
   }
  },
  {alias:'notification_bottom_global',
   fn:  (Q, flowid) => {
    return ui.notification_bottom_global(Q, flowid);
   }
  }
];

/**
  *
  */
let gen_arm = exports.gen_arm = function (I, Q, W) {
  let armname = [I.alias, Q.alias, W.alias].join('.');
  let a = {};
  a.name = armname;
  a.flow = function () {
    // interrupt, call
    resolve(triggers.reset()).then(
    () => {
      let flowid = uu();
      console.log("flow: triggers reset");
      flow.create(flowid, Q);
      flow.began();
      phonehome();

      I.fn(() => { // triggers, all are callback
        flow.offered();
        phonehome();
        console.log("flow: innteruption complete");
        // notify the experient we are done.
        emit(experiment.observer, "ran");  // one and done
        W.fn(extend({},Q, {armname: armname}), flowid); // widget fires, as param'ed by Question
      });
    }).then(
      null,
      console.error
    );
  };
  return a;
};

/** generate list of all possible arms in experiment.
  */
let generate_arms = function () {
  let out = [];
  // yes we could be fancier, but debugging permutations code is a bad use of time.
  interruptions.forEach( (I)=>{
    questions.forEach( (Q) => {
      widgets.forEach( (W) => {
        out.push(gen_arm(I, Q, W));
      });
    });
  });
  return out;
};


// module level getter
let _arms;
let ARMS = exports.ARMS = () => _arms;


/** regenerate all arms on module import.  Exported as useful for debugging
  *
  */
let regenerate = exports.regenerate = function () {
  _arms = generate_arms();
  console.log(config);
  console.log(JSON.stringify(ARMS().map((k, ii)=>ii +' ' + k.name),null,2));
};

regenerate();


