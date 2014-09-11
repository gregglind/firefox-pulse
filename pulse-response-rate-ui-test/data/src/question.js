"use strict";

console.log("question.js");

var $ = require("jquery");

var symbols = "★☆✩♡♥️";

// dev garbage
console.log("opts:", typeof self.options);

if (typeof self.options === 'undefined') {
  // fake context!
  self = {};
  console.log("FAKING options");
  self.options = {
      symbolUnlit: "☆",
      symbolLit: "★",
      outof: 5,
      afterUrl: "after.html",
      question:  "Rate Firefox"
  };
  self.port = require("./fake-port").port;
} else {
  console.log("using real 'self'")
};

// see:  http://www.radioactivethinking.com/rateit/example/example.htm

// actual worker code
(function(){
  console.log("running worker code");
  var unlit = self.options.symbolUnlit;
  var lit  = self.options.symbolLit
  var fivestar = window.document.getElementById("rating");

  // <div class="rating-x" id="rating1">&hearts;</div>

  $("#question").text(self.options.question);

  function makeEls(n) {
    $("#rating").empty();
    console.log("emptied!");
    for (var ii = 0;  ii < self.options.outof; ii++) {
      var $div = $('<div/>')
        .attr("id", "rating-" + (ii+1) )
        .addClass("rating-x")
        .text(unlit);

      // click handler
      $div.click(function (evt) {
        console.log("on",evt.target.id);
        var id = evt.target.id;
        var n = /rating\-(.*)/.exec(id)[1];
        n = Number(n,10);
        setStars(n);
        if (self===undefined) {
          console.log("no self!")
        } else {
          if (self.port === undefined) {
            console.log("no port either!");
          } else {
            console.log(Object.keys(self.port));
          }
        };
        self.port.emit('rate', {rating: n,
          outof: self.options.outof,
          question: self.options.question
        });
        self.port.emit("close");
        self.port.emit("open-afterpage");
      });

      $("#rating").append($div);
  }

  }

  function setStars(n){
    console.log('setStars',n);
    Array.forEach(fivestar.getElementsByClassName("rating-x"), function(el){
      var i = /rating\-(.*)/.exec(el.id)[1];
      i = Number(i,10);
      if (i <= n) {
        //el.classList.add("fivestar-on");
        el.textContent=lit;
      } else {
        //el.classList.remove("fivestar-on");
        el.textContent=unlit;
      }
    });
  }

  // do it all!
  makeEls();
})();
