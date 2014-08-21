

jQuery().ready(function () {
	console.log("selfhelp loaded");
	$( ".repair" ).
	mouseenter( function () {
		console.log("highlight");
		var selector = this.dataset.selector;
		console.log("highlight", selector, Date.now());
		self.port.emit("highlight", selector);
	}).
	mouseleave( function () {
		console.log("unhighlight", Date.now());
		self.port.emit("unhighlight");
	});
});












