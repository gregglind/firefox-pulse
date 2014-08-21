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

/* design questions
  - is this stupid?
  - is a mixin the right approach?
*/

const { PageMod } = require("sdk/page-mod");
const { merge, extend }  = require("sdk/util/object");
const A = require("sdk/util/array");

const self = require("sdk/self");

// so totally needs testing!
/** An object merge that is aware of 
  * the properties of PageMod
  *
  * use instead of plain extend (which is overwrite only)
  */
let modOptionsMerge = function (orig, more) {
  // some keys should extend the array, not overwrite.
  let o = merge(Object.create(null), orig);  // clone
  let m = merge(Object.create(null), more);

  let objectables = ["contentScriptOptions"];
  let arrayables = ["contentStyle", "contentStyleFile", "contentScriptFile"];

  // merge options able
  let objectMerge = function (k) {
    if (k in m) {
      o[k] = extend(o[k] || {}, m[k]);
    }
  };

  // arrayables
  let arrayMerge =function(k) {
    // 
    if (k in m || k in o) {
      let L = o[k] || [];
      let R = m[k] || [];
      L = typeof(o[k]) === "string" ? [L] : L;
      R = typeof(m[k]) === "string" ? [R] : R;
      o[k] = A.unique(L.concat(R));
    }
  };

  // overwrite
  (Object.keys(m)).forEach( function (k, i) {
    console.log(k, i);
    if (A.has(objectables,k)) {
      objectMerge(k);
    } else if (A.has(arrayables, k)) {
      arrayMerge(k);
    } else {
      o[k] = m[k]; // replace
    }
  });

  (Object.keys(o)).forEach( function (k, i) {
    console.log(k, o[k]);
  });
  return o;
};


// TODO, mixins are the wrong approach here, alas.
/** takes the same options as for PageMod, but adds some stuff
  * to allow:
  * - styling
  * - excape closes tab
  * 
  * in particular needs include
  *
  */
let pageModMixin= exports.pageModMixin = function (options) {
  let additions = {
      contentScriptFile: self.data.url("escapable.js"),
      contentStyleFile:  self.data.url("escapable.css"),
      onAttach: function onAttach(worker) {
        console.log(worker.tab.title);
        worker.port.on("escape", function() {
          console.log("should escape"); 
          worker.tab.close();
        });
      }
  };
  console.log("o-options:",Object.keys(options));

  options = modOptionsMerge(options, additions);
  console.log("modoptions:",Object.keys(options));

  let mod = PageMod(
    options
    //include: "*.mozilla.org",
    //contentScript: 'window.alert("Page matches ruleset");'
  );


  return mod;
};