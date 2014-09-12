"use strict";

console.log("uitest script!");
var $ = require("jquery");

if (self.port === undefined) {
  self.port = require("./fake-port").port;
}

// dev garbage
if (self.options === undefined) {
  console.log("using fake ui");
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
    var $li = $('<li />').
      addClass("ui-option").
      attr("id", k).
      text(k);
    $li.click(function (evt) {
      var id = evt.target.id;
      self.port.emit("ui", id);
    });
    $li.hover(
      function(){  // in
        $(this).addClass('hover');
      },
      function(){  // out
        $(this).removeClass('hover');
      }
    );
    $('#demos').append($li);
  });

})();
