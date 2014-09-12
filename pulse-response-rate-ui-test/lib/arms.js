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


// TODO, some are invalid!

// example randomization path.
//
// 3-axis
// interruption
// element
// question


let { emit } = require('sdk/event/core');

const promises = require("sdk/core/promise");
const { defer, resolve } = promises;

const ui = require("./ui");
console.log(Object.keys(ui));

const triggers = require("./triggers");
const { phonehome } = require("./phonehome");  // this is a gross dep
const experiment = require("experiment");


const { uu } = require('utils');

const config = exports.config = {
  delay: 5*60*1000  /* 5 min */
};

let randint = function(l, r) {
  if (r === undefined) {
    r = l;
    l = 0;
  }
  return Math.floor(l + (Math.random() * (r-l)));
};

let chooseArm = exports.chooseArm = function (rng, arms) {
  if (arms === undefined) arms = ARMS();
  if (rng === undefined) rng = randint(arms.length);
  console.log(rng);
  let arm = arms[rng];
  arm.number = rng;
  return arm;
};


// widget, question, interruption, all combos

// interruptions take callbacks.
const interruptions = exports.interruptions = [
  {alias: 'after_a_while',
   fn:  (cb) => triggers.after_a_while(cb, config.delay)
  },
  {alias: 'newtab',
   fn: triggers.newtab
  }
];

// question params
const questions = exports.questions = [
  {question: "Rate Firefox",
   outof: 5,
   alias: 'rate-firefox'
  },
  {question: "Would you recommend?",
    outof: 3,
    alias: 'recommend'
  },
  {question: "Are you satisfied?",
    outof: 7,
    alias: 'satisfied'
  }
];

// take (question, flowid) as params
const widgets = exports.widgets = [
  {alias:'panel_big',
   fn:  (Q, flowid) => {
    return ui.panel_big(Q, flowid);
   }},
  {alias:'panel_small',
   fn:  (Q, flowid) => {
    return ui.panel_small(Q, flowid);
   }},
  {alias:'panel_big_unnachored',
   fn:  (Q, flowid) => {
    return ui.panel_big_unanchored(Q, flowid);
   }},
  {alias:'notification_top',
   fn:  (Q, flowid) => {
    return ui.notification_top(Q, flowid);
   }
  },
  {alias:'notification_bottom',
   fn:  (Q, flowid) => {
    return ui.notification_bottom(Q, flowid);
   }
  },
  {alias:'background_tab',
   fn:  (Q, flowid) => {
    return ui.background_tab(Q, flowid);
   }
  }
];

let gen_arm = exports.gen_arm = function (I, Q, W) {
  let a = {};
  a.name = [I.alias, Q.alias, W.alias].join('$');
  a.flow = function () {
    // interrupt, call
    resolve(triggers.reset()).then(
    () => {
      let flowid = uu();
      console.log("flow: triggers reset");
      phonehome({flowid:flowid, msg: "flow-started"});

      I.fn(() => { // triggers, all are callback
      phonehome({flowid:flowid, msg: "flow-triggered"});
        console.log("flow: innteruption complete");
        // notify the experient we are done.
        emit(experiment.observer, "ran");

        W.fn(Q, flowid).go(); // widget fires, as param'ed by Question
      });
    });
  };
  return a;
};

let generate_arms = function () {
  let out = [];
  // yes we could be fancier, but debugging combinations code
  // is a bad use of time.
  interruptions.forEach( (I)=>{
    questions.forEach( (Q) => {
      widgets.forEach( (W) => {
        out.push(gen_arm(I, Q, W));
      });
    });
  });
  return out;
};

// gross little getter
let _arms;
let ARMS = exports.ARMS = () => _arms;

/** regenerate all arms.  useful for debug.
  *
  */
let regenerate = exports.regenerate = function () {
  _arms = generate_arms();
  console.log(config);
  console.log(JSON.stringify(ARMS().map((k, ii)=>ii +' ' + k.name),null,2));
};

regenerate();


// const ARMS = exports.ARMS = [
//   {name: "after_a_while:unanchored-panel:how-you-doing",
//    flow: () => {
//     resolve(triggers.reset()).then(
//     () => {
//       // callback
//       console.log("resetted");
//       triggers.after_a_while(
//         () => {
//           console.log("about to fire panel");
//           ui.panel_big({}).show();
//         },
//         200 /* ms */
//       );
//     });
//    }
//   },
//   {name: "after_a_while:unanchored-panel:how-you-doing2",
//    flow: () => {
//     resolve(triggers.reset()).then(
//     () => {
//       // callback
//       console.log("resetted");
//       triggers.after_a_while(
//         () => {
//           console.log("about to fire panel");
//           ui.panel_big({}).show();
//         },
//         200 /* ms */
//       );
//     });
//    }
//   }
// ];


// example randomization path.
//
// 3-axis
// interruption
// element
// question
