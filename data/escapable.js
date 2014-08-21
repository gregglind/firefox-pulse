document.onkeydown = function(evt) {
    evt = evt || window.event;
    if (evt.keyCode == 27) {
    	console.log("escaping!", Date.now());
        self.port.emit("escape");
    }
};


window.setTimeout(function() {
  console.log("hello!");
  document.getElementsByTagName("body")[0].classList.add("loaded");
},0);