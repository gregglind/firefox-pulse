/* License: MPL2 */

"use strict";

/*global console, self, require*/

console.log("uitest script!");
var $ = require("jquery");

(function ($) {
  console.log("after page!");
  $("*[data-ga-action]").click(function (evt){
    var action = $(this).data().gaAction;
    self.port.emit("link", action);
  });
})($);
