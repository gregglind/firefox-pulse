
/*
13:19 <willkg> if you're looking for the minimum fields for a valid hb post, then look at the curl examples:
13:19 <willkg> http://fjord.readthedocs.org/en/latest/api.html#curl-examples
13:19 <gregglind> and poll is what I change?
13:20 <gregglind> cool, this is rad.  Should I make up a fake poll, or do you have cleaning ability?
13:20 <willkg> oh, right. so the only poll that's valid right now is "test-poll".
13:20 <willkg> sorry about that.
13:20 <willkg> you can see the polls and the tail of the hb data here: https://input.mozilla.org/en-US/analytics/hb
*/

let request = require("sdk/request");

let URI="https://input.mozilla.org/api/v1/hb/";

let example_payload = {
    "locale": "en-US",
    "platform": "Linux",
    "product": "Firefox",
    "version": "30.0",
    "channel": "stable",
    "poll": "test-poll",
    "question": "Speed of unladen swallow",
    "pulse": true,
    "testing": true,
    "answer": "13"
};


let phonehome = exports.phonehome = function (dataObject, url){
	function requestCompleted(which, response) {
		console.log("REQUEST COMPLETE", which, response.status, response.text);
	}
  if (dataObject === undefined) {
    dataObject = example_payload;
  }

	if (true) {  // handle some configs with no phoning...
		let request_fjord= new request.Request({
			url: url || URI,
			onComplete: requestCompleted.bind(null,"Input"),
			content: JSON.stringify(dataObject),
			contentType: "application/json",
			headers: {"Accept": "application/json; indent=4"}
		});
    console.log(JSON.stringify(dataObject));
		request_fjord.post();
	} else {
		console.log("not sending");
	}
};