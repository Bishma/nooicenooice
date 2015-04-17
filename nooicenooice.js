var async = require('async');
var Wobot = require('wobot');
var Wobotutil = require('./util.wobot.js');
var Hipchatterutil = require('./util.hipchatter.js');
var Handle = require('./util.handle.js');
var Cleverbot = require('cleverbot-node');
var config = require('./config');
var retorts = require('./retorts');
var util = require('./util.js');

// interval in case we need to attempt to reconnect
var connectRetry;

// available rooms and users (at last poll)
var roster = new Object;
var rooms = new Object;
var emoticons = new Array;

var b = new Wobot.Bot({
  jid: config.userJid,
  password: config.password
});

// if there is an api key then instane hippchatter
if (config.apiToken.length > 0) {
  var Hipchatter = require('hipchatter');
  var hc = new Hipchatter(config.apiToken);
  util.hipchatter = new Hipchatterutil(hc);
}

// instance the wobot utility script and pass in this instance of wobot
util.wobot = new Wobotutil(b);

// instance the commands module
util.handle = new Handle(util.wobot,b);

b.connect();

// instance cleverbot
var cb = new Cleverbot;

b.onConnect(function() {
	// poll for rooms and people every 10 minutes
	pollster();
	setInterval(pollster,3600000);

	function pollster() {
		// function to add type meta data to polled documents
		function addType(tarray,type) {
			tarray.forEach(function(val,i) {
				val['_type'] = type;
				tarray[i] = val;
			});
			return tarray;
		}

		// clear existing values between polls
		util.memory.roster.remove({}, { multi: true },function (err, num) {
			if (err) {
				console.log(' -=- !> Unable to clear memory: '+err);
			}
			console.log(' -=- >> Cleared '+num+' records.');
		});

		util.wobot.pollRoster(function(rosterlist) {
			rosterlist = addType(rosterlist,'user');
			util.memory.roster.insert(rosterlist);
		});

	    util.wobot.pollRooms(function(roomlist) {
			roomlist = addType(roomlist,'room');
			util.memory.roster.insert(roomlist);
		});

		// run the emoticon polling only if the hipchatter utils is instanced
		if (util.hasOwnProperty('hipchatter')) {
			util.hipchatter.pollEmoticons(function(iconlist) {
				iconlist = addType(iconlist,'emoticon');
				util.memory.roster.insert(iconlist);
			});
		}
	} // end pollster

	// record the start time
	util.memory.tracking.insert({
		_type: 'starttime',
		timestamp: Date.now()
	});

	// join any rooms in the autojoin array
	if (Array.isArray(config.autojoin)) {
		config.autojoin.forEach(function(jid) {
			util.wobot.join(jid);
		});
	} // end if (isObject)
	else {
		console.log(" -=- !> config.autojoin is not an array. Unable to autojoin rooms");
	}

	// join any rooms that nooicenooie had previously joined
	util.memory.tracking.find({ _type: 'inroom' }, function (err,docs) {
		if (err) {
			console.log(' -=- !> Unable to get room list: '+err);
		}
		docs.forEach(function(doc) {
			// no sense in trying to join a room we joined as part of auto join
			if (Array.isArray(config.autojoin)) {
				if (!util.inArray(doc["jid"],config.autojoin)) {
					util.wobot.join(doc["jid"]);
				} // end if
			} // end if
		}); // end docs.forEach
	});
	clearInterval(connectRetry);
});

b.onInvite(function(channel, from, reason) {
  console.log(' -=- > Invited to ' + channel + ' by ' + from + ': ' + reason);
  util.wobot.join(channel);
  // random hello message
  setTimeout(function() {
    util.wobot.msg(channel,util.relem(retorts.hello));
  },300)
});

b.onDisconnect(function() {
  console.log(' -=- > Disconnect. Attempting reconnect every minute');
  connectRetry = setInterval(function() {
    b.connect();
  },60000)
});

b.onError(function(error, text, stanza) {
  console.log(' -=- > Error: ' + error + ' (' + text + ')');
});

// room listening function
b.onMessage(function(channel, from, message) {
  if (config.commandTest.test(message)) {
    var matches = message.match(config.commandTest);
    console.log(' -=- > command in '+channel+' from '+from+' issued: '+matches[2]);
    util.handle.command(channel,matches[2]);

    // track that a command was used
    var cmd = message.replace(config.commandTest,"$2");
    trackCommand(cmd);
  } 
  else {
	var toSend = util.handle.passive(message);
	if (typeof toSend == 'string' && toSend.length > 0) {
	    util.wobot.msg(channel,toSend);
	} // end if
  } // end else
});

b.onPrivateMessage(function(jid, message) {
  if (config.commandTest.test(message)) {
    var cmd = message.replace(config.commandTest,"$2");
    util.handle.command(jid,cmd);

    // track that a command was used
    trackCommand(cmd);
  }
  else {
    cb.write(message,function(response) {
      util.wobot.msg(jid,response.message);
    });
  }

  util.memory.tracking.findOne({ _type: 'peoplePmd', 'jid': jid }, function(err,doc) {
	if (err) {
		console.log(' -=-!> Unable to lookup PM details: '+err);
	}
	if (doc) {
		doc["messageCount"] += 1;
		doc["lastDate"] = Date.now();
		util.memory.tracking.update({ _id: doc["_id"] }, doc, {}, function (err, updoc) {
			if (err) {
				console.log(' -=-!> Unable to update PM tracking: '+err);
			} // end if
		}); // end update
	} // end if
	else {
		var doc = {
			_type: 'peoplePmd',
			'jid': jid,
			messageCount: 1,
			lastDate: Date.now()
		};
		util.memory.tracking.insert(doc, function(err,newDoc) {
			if (err) {
				console.log(' -=-!> Unable to insert new PM tracking doc: '+err);
			}
		});
	}
  });
});

function trackCommand(cmd) {
    util.memory.tracking.findOne({ _type: 'commandsIssued', command: cmd }, function (err,doc) {
		if (err) {
			console.log(' -=-!> Unable to find command tracking info: '+err);
		}
		if (doc) {
			doc["issueCount"] += 1;
			doc["lastDate"] = Date.now();
			util.memory.tracking.update({ _id: doc["_id"] }, doc, {}, function(err,updoc) {
				if (err) {
					console.log(' -=-!> Unable to update command tracking: '+err);
				}
			});
		}
		else {
			var doc = {
				_type: 'commandsIssued',
				command: cmd,
				issueCount: 1,
				lastDate: Date.now()
			}
			util.memory.tracking.insert(doc, function(err,newDoc) {
				if (err) {
					console.log(' -=-!> Unable to insert command tracking doc: '+err);
				}
			});
		}
	});
}
