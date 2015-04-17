// wobot (xmpp) specific utility functions
var bot;

// bring in the util functions
var util = require('./util.js');

function Wobotutil(b) {
	bot = b;
}

// method for getting the current roster of hipchat users for the account
Wobotutil.prototype.pollRoster = function(callback) {
	console.log(' -=- >> Polling for people');
	bot.getRoster(function(err, items) {
		if (err) {
			console.log(' -=- !> Error getting roster: '+err);
			return false;
		}
		callback(items);
	});
}; // end pollRoster
	
// method for getting the current roster of rooms in the hipchat account
Wobotutil.prototype.pollRooms = function(callback) {
	console.log(' -=- >> polling for rooms');
	bot.getRooms(function(err, items) {
		if (err) {
			console.log(' -=- !> Error getting rooms: '+err);
			return false;
		}
		callback(items);
	});
}; // end pollRooms

//  method for taking various room inputs and roing the room appropriately
Wobotutil.prototype.join = function(room) {
	var room_string = jidString(room); // turn common room formats to a string of proper format

	bot.join(room_string);

	// try to find the room in the tracking db
	// if it doesn't exist add it
	util.memory.tracking.findOne({ _type: 'inroom', jid: room_string},function(err,doc) {
		if (err) {
			console.log(' -=- !> Error querying tracking db: '+err);
		}
		if (!doc) {
			util.memory.tracking.insert({
				_type: 'inroom',
				jid: room_string
			},function (inerr,newDoc) {
				if (inerr) {
					console.log(' -=- !> Error inserting room: '+inerr);
				}
			});
		} // end if
	});

	console.log(' -=- >> Room '+room+' joined');
}; // end join

Wobotutil.prototype.msg = function(jid,message) {
		lmsg(jid,message);
	}; // end msg

// local message function to me use across any other functions
function lmsg(jid,message) {
	room_string = jidString(jid,'room');

	util.memory.roster.findOne({ 'jid': jid},function(err,docs) {
		var toDisp = jid;
		if (docs) {
			toDisp = docs["name"];
		}
		console.log(' -=- >> Sending message to '+toDisp);
	});
	bot.message(room_string,message);
	// @todo: restore memory functionality
} // end localmsg

// take a user or room in object or string format and make a string of format name@domain
function jidString(jid,type) {
	type = typeof type !== 'undefined' ? type : 'room'; // set a default for type
	var returnString = '';
	var fallback = {
		'room':'conf.hipchat.com',
		'user':'chat.hipchat.com'
	};

	// attempt to assemble a useable room string
	if (typeof jid == "string") {
		if (/@/.test(jid)) {
			returnString = jid;
		}
		else {
			// make sure we have a valid type
			if (!fallback.hasOwnProperty(type)) {
				console.log(' -=- !> Unknown join type '+type);
				return false;
			}
			returnString = jid+'@'+fallback[type]; // use the fallback of appropriate type
		}
	} // end if (string)
	// if we have a object with local and domain then assemble into a usable string
	else if (typeof jid == "object" && jid.hasOwnProperty('local') && jid.hasOwnProperty('domain')) {
		returnString = jid.local+'@'+jid.domain;
	}
	// fall through to an error
	else {
		console.log(' -=- !> Error building room JID');
		console.log(jid);
		return false;
	}
	return returnString;
}; // end jidString

module.exports = Wobotutil;
