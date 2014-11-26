"use strict";

/*global console, self, require*/

console.log("uitest script!");
var $ = require("jquery");

/*
if (self.port === undefined) {
  self.port = require("./fake-port").port;
}

// dev garbage
if (self.options === undefined) {
  console.log("using fake ui");
  self.options = {
  };
}
*/

(function ($) {
  console.log("after page!");
  $("*[data-ga-action]").click(function (evt){
    var action = $(this).data().gaAction;
    self.port.emit("link", action);
  });
})($);
