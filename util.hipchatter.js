// hipchatter (version 2 API) specific utility functions
var hip;

// bring in util function
var util = require('./util.js');

function Hipchatterutil(hc) {
	hip = hc;
}

// method for polling for emoticons
Hipchatterutil.prototype.pollEmoticons = function(callback) {
	console.log(' -=- >> polling for emoticons');
	var fulllist = new Array;
	var pagerOps = {
		'start-index': 0,
		'max-results': 50,
		'type': 'all'
	}

	var fullPage = true;

	// looping function is needed to be able to get the full list given the API constraints
	(function emloop() {
		// as soon as we don't get a full page we'll assume we're done
		if (fullPage == true) {
			// query a page of 
			hip.emoticons(pagerOps,function(err, emoticons) {
				if (err) {
					console.log(" -=- > Got and API error in emoticons: " + err);
				}

				// test for proper return
				if (typeof emoticons != 'object' || emoticons.length < pagerOps['max-results']) {
					fullPage = false;
				}

				var message = '';
				if (util.isObject(emoticons)) {
					emoticons.forEach(function(emoticon) {
						// add the emoticon to the full list
						fulllist.push(emoticon);
					});
				}
				else {
					message = "I wasn't able to get a list of emoticons. Sadness ensues.";
				}
				pagerOps['start-index'] += pagerOps['max-results'];
				emloop();
			});
		}
		else {
			callback(fulllist);
		}
	}());
};

module.exports = Hipchatterutil;
