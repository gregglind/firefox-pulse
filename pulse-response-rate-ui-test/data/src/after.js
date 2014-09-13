"use strict";

/*global console, self, require*/

console.log("uitest script!");
var $ = require("jquery");

if (self.port === undefined) {
  self.port = require("./fake-port").port;
}

// dev garbage
if (self.options === undefined) {
  console.log("using fake ui");
  self.options = {
    question: {question: "Rate Firefox",
      rating: 1,
      outof: 5,
      alias: 'rate-firefox'
    },
    flowid: 1234
  };
}

(function ($) {
  console.log("after page!");

  $("a").click(function (evt){
    var id;
    var out;
    id = $(evt.target).closest('a').attr("id");
    out = $.extend(true, self.options, {link: id});
    self.port.emit("link", out);
  });

})($);
