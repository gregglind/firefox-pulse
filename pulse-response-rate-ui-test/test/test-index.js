var utils = require("./utils-for-testing");

var main = require("index");


exports["test main"] = function(assert) {
  assert.pass("Unit test running!");
};

exports["test main async"] = function(assert, done) {
  done = utils.doneclean(done);
  assert.pass("async Unit test running!");
  done();
};


require("sdk/test").run(exports);
