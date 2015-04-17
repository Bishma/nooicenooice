// parse and handle messages
// this module will accept plugins

// bring in the utilities
var async = require('async');
var fs = require('fs');
var util = require('./util.js');
util.wobot;
var retorts = require('./retorts.js');
var pplugs = {}; // a place to hold all passive plugins
// @todo: load plugins via config file
pplugs.easter = require('./plugins/easter.js');

var bot;

function Handle(uw,b) {
	util.wobot = uw;
	bot = b;
}

Handle.prototype.command = function(jid,cmd) {
  switch(cmd) {
	// unimplimented command
	default:
	  util.wobot.msg(jid,util.relem(retorts.confused));
	  break;
	case 'help':
	  util.wobot.msg(jid,retorts.help(config.version));
	  break;
	// leave a room
	case 'leave':
	case 'quit':
	case 'exit':
	  // keep things interesting with random responses
	  util.wobot.msg(jid,util.relem(retorts.goodbye));
	  // delay leaving for a second so the retort comes fisrt
	  setTimeout(function() {
		bot.part(jid);
	  },500);
	  break;
	// give stats
	case 'report':
		async.series([
			// get the lastest timestamp from the tracking database
			function(callback) {
				util.memory.tracking.findOne({
					_type: 'starttime'
				}).sort({
					timestamp: -1
				}).exec(function(err,doc) {
					var now = Date.now();
					var uptime = util.timeDisp(Math.abs(doc["timestamp"] - now));
					callback(null,"Uptime: "+uptime);
				});
			},
			// get a count of rooms that have been joined
			function(callback) {
				util.memory.tracking.count({ _type: 'inroom' }, function(err,doc) {
					callback(err,"Number or rooms occupied: "+doc);
				});
			},
			function(callback) {
				util.memory.tracking.count({ _type: 'peoplePmd' }, function (err,doc) {
					callback(err,"Number of people PMd: "+doc);
				});
			},
			function(callback) {
				util.memory.tracking.find({ _type: 'peoplePmd' }, function(err,docs) {
					var total = 0;
					docs.forEach(function(doc) {
						if (!isNaN(doc["messageCount"]))
							total += parseInt(doc["messageCount"]);
					});
					callback(err,"Total PM's sent: "+total);
				});
			},
			function(callback) {
				util.memory.tracking.find({ _type: 'commandsIssued' }, function (err,docs) {
                    var total = 0;
                    docs.forEach(function(doc) {
                        if (!isNaN(doc['issueCount']))
                            total += parseInt(doc['issueCount']);
                    });
					callback(err,"Number of commands issued: "+total);
				});
			},
			function(callback) {
				util.memory.tracking.findOne({
					_type: 'commandsIssued'
				}).sort({
					issueCount: -1	
				}).exec(function(err,doc) {
					callback(err,"Most popular command issued: "+doc["command"]);
				});
			}
		],function(err,results) {
			if (err) {
				console.log(' -=- !> A report error has occured: '+err);
			}

			util.wobot.msg(jid,results.join("\n"));
		});
		break;
	// send all the emoticons
	case 'emote':
		var emoticons = [];
		async.series([
			function(callback) {
				var err;
				util.memory.roster.find({ _type: 'emoticon' },function(err,docs) {
					if (!err) {
						docs.forEach(function(doc) {
							emoticons.push(doc["shortcut"]);
						});
					} // end if
					callback(err,'gathered');
				});
			},
			function(callback) {
				if (emoticons.length > 0) {
					var rowLength = 12;
					var linesPerMsg = 4;
					var lineCount = 0;
					var message = '';

					for (var i = 0; i < emoticons.length; i++) {
						message = message+'('+emoticons[i]+')';
						if (i > 0 && i % rowLength == 0) {
							lineCount++

							if (lineCount < linesPerMsg)
								message = message+"\n";
							else {
								util.wobot.msg(jid,message);
								message = '';
								lineCount = 0;
							}
						}
					} // end for

					if (message != '')
						util.wobot.msg(jid,message);
				}
				else {
					util.wobot.msg(jid,"I'm afraid I'm not set up for that right now.");
				}
				callback(null,'output');
			} // end function
		], function (err, results) {
			if (err) {
				console.log(' -=- !> Series error: '+err);
				console.log(results);
			}
		}); // end series
		break;
	} // end switch
}


Handle.prototype.passive = function(message) {
	if (/\(nooice\)/i.test(message)) {
		return "I'm nooiceing your nooice";
	}
	else if (/noice/i.test(message)) {
		return "I think you mean (nooice)";
	}
	// plug-in style handlers
	else {
		// loop though each plugin
		var resp;
		// get all the types of plugins
		Object.keys(pplugs).forEach(function (plugin) {
			// get all the actions within this plugin
			Object.keys(pplugs[plugin]).forEach(function (action) {
				// use the action's test to see if it matches
				if (pplugs[plugin][action].test.test(message)) {
					resp = pplugs[plugin][action].response(message);
				}
			});
		});
		// return any string response from any action within any plugin
		if (typeof resp == "string" && resp.length > 0) {
			return resp;
		}
	}
}

module.exports = Handle;
