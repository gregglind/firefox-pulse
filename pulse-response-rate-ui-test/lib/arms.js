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

const dh = require("./ui/doorhanger");
const triggers = require("./triggers");

const promises = require("sdk/core/promise");
const { defer, resolve } = promises;

let randint = function(l, r) {
  if (r === undefined) {
    r = l;
    l = 0;
  }
  return Math.floor(l + (Math.random() * (r-l)));
};

let chooseArm = exports.chooseArm = function (rng, arms) {
  if (arms === undefined) arms = ARMS;
  if (rng === undefined) rng = randint(arms.length);
  console.log(rng);
  let arm = arms[rng];
  arm.number = rng;
  return arm;
};


/* list of objs of {name: jsonable, factory? } */
const ARMS = exports.ARMS = [
  {name: "after_a_while:unanchored-panel:how-you-doing",
   flow: () => {
    resolve(triggers.reset()).then(
    () => {
      // callback
      console.log("resetted");
      triggers.after_a_while(
        () => {
          console.log("about to fire panel");
          dh.msgPanel({
          }).show();
        },
        200 /* ms */
      );
    });
   }
  },
  {name: "after_a_while:unanchored-panel:how-you-doing2",
   flow: () => {
    resolve(triggers.reset()).then(
    () => {
      // callback
      console.log("resetted");
      triggers.after_a_while(
        () => {
          console.log("about to fire panel");
          dh.msgPanel({
          }).show();
        },
        200 /* ms */
      );
    });
   }
  }
];


// example randomization path.
//
// 3-axis
// interruption
// element
// question
