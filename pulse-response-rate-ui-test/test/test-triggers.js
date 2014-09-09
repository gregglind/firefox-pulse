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

const promises = require("sdk/core/promise");
const { defer, resolve } = promises;

const tabs = require("sdk/tabs");

let utils = require("./utils-for-testing");

let triggers = require("triggers");

exports["test newtab trigger fires"] = function (assert, done) {
  done = utils.doneclean(done);
  triggers.reset();

  // set up new tab trigger
  let fn = function () {
    assert.pass("newtab caught");
    done();
  };
  let t = triggers.newtab(fn);
  tabs.open("about:blank");
};

exports["test mutiple newtab triggers fire"] = function (assert, done) {
  done = utils.doneclean(done);
  triggers.reset();

  // set up new tab trigger
  let count = 0;
  let n = 2;
  let fn = function () {
    count ++;
    assert.pass("newtab caught:" + count);
    if (count >= n) {
      done();
    }
  };

  triggers.newtab(fn);
  triggers.newtab(fn);

  tabs.open("about:blank");
};

// TODO, as new triggers are creaeted, add them here!
exports["test triggers reset actually resets"] = function (assert, done) {
  done = utils.doneclean(done);

  let oks = 0;
  let n = 2;

  let nope = function () {
    assert.fail("should not be seen! " + this.str);
  };

  // SETUPS (one per trigger type)

  // set up new tab trigger
  triggers.newtab(nope.bind(null, "newtab"));

  // new while trigger
  triggers.after_a_while(nope.bind(null, "after_a_while"), 300 /*ms*/);

  // CLEAR

  // actually clear triggers
  triggers.reset();  // should clear! no guarantees on how fast


  // TESTS (one per trigger type)

  // tests:  tab open context
  tabs.open({
    url:"about:blank",
    onOpen: () => utils.wait(100).then(
    () => {
      assert.pass("no trigger happened");
      oks ++;
      done();
    }) // basically, no signal is good!
  });

  // tests: after_a_while
  utils.wait(300).then(()=> {assert.pass("after_a_while ok"); oks++;});


  // FINAL CHECK
  utils.wait(1000).then(()=> oks >= n && done());

};


exports['test after_a_while works'] = function (assert, done) {
    triggers.after_a_while(() => {
      assert.ok("caught after_a_while");
      done();
    },
    100);
};

require("sdk/test").run(exports);

