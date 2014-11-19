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

const { extend } = require("sdk/util/object");

/** reminder, extend(a, b, c) takes all keys
  - on a.prototype
  - b, c
*/
exports['test extend'] = function(assert) {
  let a = {a: 1};
  let b = {b: 2};
  let c = extend(a, b);
  assert.deepEqual(Object.keys(c).sort(), ['b'], 'cool' );
  a = extend(a,b);
  assert.deepEqual(Object.keys(a).sort(), ['b'], 'cool' );

  a = {a: 1};
  b = {b: 2};
  a = extend({}, a, b);
  assert.deepEqual(Object.keys(a).sort(), ['a', 'b'], 'cool' );
};

exports['test from docs'] = function(assert) {
  var a = { alpha: "a" };
  var b = { beta: "b" };
  var g = { gamma: "g", alpha: null };
  var x = extend(a, b, g);
  assert.deepEqual(x, { alpha: null, beta: "b", gamma: "g" });
};

require('sdk/test').run(exports);
