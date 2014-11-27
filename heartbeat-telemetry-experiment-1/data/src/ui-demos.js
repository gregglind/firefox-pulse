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
    ui: [
      "panel_big",
      "panel_small",
      "panel_big_unanchored",
      "notification_top",
      "notification_bottom",
      "background_tab",
      "about_newtab_mod"
    ],
    questions: [
      {question: "Rate Firefox",
       outof: 5,
       alias: 'rate-firefox'
      },
      {question: "How likely are you to choose Firefox over other browsers in the future?",
        outof: 10,
        alias: 'recommend'
      },
      {question: "Rate your experience with Firefox over the past few weeks",
        outof: 5,
        alias: 'satisfied'
      }
    ]
  };
}

(function () {
  console.log("ui!");
  self.options.ui.forEach(function (k, ii) {
    var $li = $('<li />').
      addClass("ui-option").
      attr("id", k).
      text(k);
    $li.click(function (evt) {
      var which = $();
      var id = evt.target.id;
      var q = self.options.questions[which_q()];
      self.port.emit("ui", id, q);
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

  console.log("questions!");
  self.options.questions.forEach(function (k, ii) {
    console.log(k);
    var id = 'question-' + ii;
    var $radio = $('<input />').
      attr("type", "radio").
      attr("name", "question").
      attr("value", ii).
      addClass("question-option").
      attr("id", id);

    var $label = $('<label />').
      attr("id", "label-" + id).
      attr("for", id).
      text([k.msg, k.alias, k.qtype].join(" :: "));

    $label.click(function() {
       var labelID = $(this).attr('for');
       $('#'+labelID).trigger('click');
    });

    $label.hover(
      function(){  // in
        $(this).addClass('hover');
      },
      function(){  // out
        $(this).removeClass('hover');
      }
    );
    $('#question-text').append($radio);
    $('#question-text').append($label);
    $('#question-text').append($("<br />"));

  });

  // set one!
  $("#question-2").trigger("click");

  var which_q = function () {
    return Number($('input[name=question]:checked').val() || 0, 10);
  };

})();
