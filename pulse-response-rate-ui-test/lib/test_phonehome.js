/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global */

'use strict';

const promises = require('sdk/core/promise');
const { defer, resolve } = promises;

let utils = require('./utils-for-testing');



/** model test.  copy as necessary!

// REMEMEBER, if done() is your last step in a test
// it's probably not really async()


exports['test asyn'] = function(assert, done) {
  done = utils.doneclean(done);
  assert.pass();
  done();
};

exports['test sync'] = function(assert) {
  assert.pass();
};


*/

require('sdk/test').run(exports);
