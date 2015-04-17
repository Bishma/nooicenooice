var easter = {}

// as is tradition, please hold on to your butts (jurassic park meme)
easter.butts = {
	"test": new RegExp("hold on to your butt","i"),
	"response": function (message) {
		var sfwbutts = [
			"http://idx-staticassets.s3.amazonaws.com/nooicenooice/holdon_purp.png",
			"http://idx-staticassets.s3.amazonaws.com/nooicenooice/holdon_float.jpg",
			"http://idx-staticassets.s3.amazonaws.com/nooicenooice/holdon_draw.png",
			"http://idx-staticassets.s3.amazonaws.com/nooicenooice/holdon_basic.jpg",
			"http://idx-staticassets.s3.amazonaws.com/nooicenooice/holdon_bar.png"
		];
		return sfwbutts[Math.floor(Math.random()*sfwbutts.length)];
	}
};

// mst3k "can't we get beyond thunderdome
easter.thunderdome = {
	"test": new RegExp("thunderdome","i"),
	"response": function (message) {
		return "https://www.youtube.com/watch?v=XEI_udV88i4#t=11";
	}
}

// knowing is half the battle meme
easter.know = {
	"test": new RegExp("now you|i know\s*$","i"),
	"response": function (message) {
		var knows = [
			"http://idx-staticassets.s3.amazonaws.com/nooicenooice/knowing_google.png",
			"http://idx-staticassets.s3.amazonaws.com/nooicenooice/knowing_graph.png",
			"http://idx-staticassets.s3.amazonaws.com/nooicenooice/knowing_guns.png",
			"http://idx-staticassets.s3.amazonaws.com/nooicenooice/knowing_jo.png"
		];
		return knows[Math.floor(Math.random()*knows.length)];
	} 
}

// show our opinion on florida
easter.florida = {
    "test": new RegExp("florida(?!\\))","i"), // match "florida" only if not followed by a end parens
    "response": function (message) {
        return "(florida)"
    }
}

easter.ignoreme = {
    "test": new RegExp("ignore me.*$","i"),
    "response": function (message) {
        return "http://idx-staticassets.s3.amazonaws.com/nooicenooice/ignoreme.jpeg";
    }
}

module.exports = easter;
