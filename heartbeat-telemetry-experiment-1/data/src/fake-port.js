console.log("FAKING port");

var $ = require("jquery");
window.$ = $;

/* could make this fancier! */
exports.port = {
		on:  console.log.bind(console,"on"),
		off: console.log.bind(console,"off"),
		once: console.log.bind(console,"once"),
		emit: console.log.bind(console,"emit"),
		removeListener: console.log.bind(console,"removeListener"),
    baloney: "this is a fake port!"
};

