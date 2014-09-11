"use strict";

console.log("uitest script!");
var $ = require("jquery");

if (self.port === undefined) {
  self.port = require("./fake-port").port;
}

// dev garbage
if (self.options === undefined) {
  self.options = {
    ui: [
      "panel_big",
      "panel_small",
      "panel_big_unanchored",
      "notification_top",
      "notification_bottom",
      "background_tab",
      "about_newtab_mod"
    ]
  };
}


(function () {
  self.options.ui.forEach(function (k, ii) {
    var $div = $('<div />').
      attr("id", k).
      css("border", '2px solid red').
      text(k);
    $div.click(function (evt) {
      var id = evt.target.id;
      self.port.emit("ui", id);
    });
    $('body').append($div);
  });

})();
