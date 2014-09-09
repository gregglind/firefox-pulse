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

  // set up new tab trigger
  let tabfn = function () {
    assert.fail("should not be seen!");
  };
  triggers.newtab(tabfn);

  // actually clear triggers
  triggers.reset();  // should clear! no guarantees on how fast

  tabs.open({
    url:"about:blank",
    onOpen: () => utils.wait(100).then(
    () => {
      assert.pass("no trigger happened");
      done();
    }) // basically, no signal is good!
  });
};


require("sdk/test").run(exports);

