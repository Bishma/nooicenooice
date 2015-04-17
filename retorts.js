var retorts = {};

// hellos
retorts.hello = [
  "Here I am!",
  "And here I go again on my own\nGoing down the only road I've ever known",
  "It's showtime!",
  "You rang?",
  "(wubalubadubdub)",
  "nooicenooice is here to nooice your (nooice)"
];

// goodbyes
retorts.goodbye = [
  "nooicenooice will miss you!",
  "nooicenooice can take a hint.",
  "nooicenooice has had fun!",
  "kthxbye",
  "(tableflip)",
  "nooicenooice is outie 9000. PEACE!"
];

// confusion
retorts.confused = [
  "nooicenooice is confused",
  "(shrug)",
  "I'm not sure that means what you think it means.",
  "I am a simple robot, you must use commands I know.",
  "Try \"nooicenooice please help\" if you're unsure what command you want to use.",
  "My capabilities are clearly documented. I'm not sure what you're trying to accomplish."
];

retorts.help = function(version) {
  var message = "I can help you make best use of me, but for other matters you're on your own.\n"
    + "I am version "+version+"\n"
    + "I am able to have slow and stilted conversations with you in one on one chats.\n"
    + "You can invite me into any public hipchat room using hipchat's native invite functionality\n"
    + "Within hipchat rooms I will nooice your nooice but stay out of more complex situations as to not be annoying\n"
    + "I am also able to respond to some requests, though I want you to be polite about it.\n"
    + " - \"nooicenooice please emote\" will make me show all available emoticons.\n"
    + " - \"nooicenooice please leave\" will make me leave a room.\n"
    + " - \"nooicenooice please help\" will display this information again.\n"
    + " - \"nooicenooice please report\" will have me generate some stats about my usage.\n"
    + "I will get smarter with time. Utimately I am here to make hipchat a better productivity tool.\n";
  return message;
};

module.exports = retorts;
