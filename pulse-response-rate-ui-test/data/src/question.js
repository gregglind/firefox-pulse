/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global console, self*/

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
      question:  "Rate Firefox",
      flowid: "abcdef"
  };
  self.port = require("./fake-port").port;
} else {
  console.log("using real 'self'");
}

// see:  http://www.radioactivethinking.com/rateit/example/example.htm

// actual worker code
(function(){
  console.log("running worker code");
  var unlit = self.options.symbolUnlit;
  var lit  = self.options.symbolLit;
  var fivestar = window.document.getElementById("rating");

  // <div class="rating-x" id="rating1">&hearts;</div>

  $("#question").text(self.options.question);

  function makeEls() {
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
        var packet = $.extend(true, self.port.options, {rating: n});
        n = Number(n,10);
        setStars(n);
        if (self===undefined) {
          console.log("no self!");
        } else {
          if (self.port === undefined) {
            console.log("no port either!");
          } else {
            console.log(Object.keys(self.port));
          }
        }
        self.port.emit('rate', packet);
        self.port.emit("close");
        self.port.emit("open-afterpage", packet);
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

  $("#nothanks").click(function (evt) {
    self.port.emit('refuse', {
      question: self.options.question,
      flowid: self.options.flowid
    });
    self.port.emit("close");
  });



  // do it all!
  makeEls();
})();
