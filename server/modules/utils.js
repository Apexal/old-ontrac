// A bunch of helper functions (mainly for Jade)
var moment = require("moment");
// The site I found this on was British, can you tell?
var words = ["anal", "anus", "arse", "ass", "ballsack", "balls", "bastard", "bitch", "biatch", "bloody", "blowjob", "blow job", "bollock", "bollok", "boner", "boob", "bugger", "bum", "butt", "buttplug", "clitoris", "cock", "coon", "crap", "cunt", "damn", "dick", "dildo", "dyke", "fag", "feck", "fellate", "fellatio", "felching", "fuck", "f u c k", "fudgepacker", "fudge packer", "flange", "Goddamn", "God damn", "hell", "homo", "jerk", "jizz", "knobend", "knob end", "labia", "lmao", "lmfao", "muff", "nigger", "nigga", "omg", "penis", "piss", "poop", "prick", "pube", "pussy", "queer", "scrotum", "sex", "shit", "s hit", "sh1t", "slut", "smegma", "spunk", "tit", "tosser", "turd", "twat", "vagina", "wank", "whore", "wtf"];

module.exports = {
  getGreetingTime: function(m) {
  	var g = null; //return g

  	if(!m || !m.isValid()) { return; } //if we can't find a valid or filled moment, we return.

  	var split_afternoon = 12 //24hr time to split the afternoon
  	var split_evening = 17 //24hr time to split the evening
  	var currentHour = parseFloat(m.format("HH"));

  	if(currentHour >= split_afternoon && currentHour <= split_evening) {
  		g = "afternoon";
  	} else if(currentHour >= split_evening) {
  		g = "evening";
  	} else {
  		g = "morning";
  	}

  	return g;
  },
  pluralize: function(num, non, pluralized) {
    if(num == 0 || num > 1)
      return pluralized;
    else
      return non;
  },
  banned: words,
  filter: function(str){
    words.forEach(function(word) {
      var re = new RegExp(word, 'g');
      str = str.replace(re, 'Vode');
    });
    return str;
  },
  clean: function(word) {
    words.forEach(function(word) {
      if(str.includes(word)){
        return false;
      }
    });
    return true;
  },
  isPage : function(word, other) {
    return (word.indexOf(other) > -1 ? "active" : "");
  },
  isReach: function(department) {
    return (department.indexOf("REACH") > -1);
  },
  advisor: function(adv) {
    for (var key in adv.teacher) {
      console.log(key, adv.teacher[key]);
    }
    return adv.teacher.toJSON();
  }
}
