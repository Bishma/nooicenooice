var util = {};

// basic PHP style inArray function
util.inArray = function(needle,haystack) {
  if (haystack.indexOf(needle)==-1)
    return false;
  else
    return true;
}; // end inArray

// returns true if item is a non-null object
util.isObject = function(item) {
  if((typeof item == "object") && (item !== null)) {
    return true;
  }
  else {
    return false;
  }
}; // end isObject

// take time in miliseconds and make it more human readable
util.timeDisp = function(time) {
  var disp = 's';
  time = time / 1000;
  if (time > 86400) {
    time = time / 86400
    disp = 'd';
  }
  else if (time > 3600) {
    time = time / 3600;
    disp = 'h';
  }
  else if (time > 60) {
    time = time / 60;
    disp = 'm'
  }
  return time.toPrecision(3)+disp;
}; // end timeDisp

// return a random element from a tring
util.relem = function(array) {
  return array[Math.floor(Math.random()*array.length)];
}; // end relem

var Datastore = require('nedb');
util.memory = {};
util.memory.tracking = new Datastore({
	filename: 'brains/tracking.nedb',
	autoload: true
});
util.memory.tracking.persistence.setAutocompactionInterval(60 * 60 * 12 * 1000); // compact every 12 hours
util.memory.roster = new Datastore({
	filename: 'brains/roster.nedb',
	autoload: true
})
util.memory.roster.persistence.setAutocompactionInterval(60 * 60 * 3 * 1000); // compact every 3 hours

module.exports = util;
