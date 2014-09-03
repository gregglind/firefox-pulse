"use strict";

(function(){
	//var unlit = "☆";
	//var lit  = "★";
	var fivestar = window.document.getElementById("fivestar");

	Array.forEach(fivestar.getElementsByClassName("fivestar-x"),function(el){
		var n = /fivestar(.*)/.exec(el.id)[1];
		n = Number(n,10);
		el.addEventListener("click", function(evt){
			self.port.emit("message", {"what":"phonehome"});
		});
	});
})();