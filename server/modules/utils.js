// A bunch of helper functions (mainly for Jade)
var moment = require("moment");
// The site I found this on was British, can you tell?
var words = ["anal", "anus", "ass", "ballsack", "balls", "bastard", "bitch", "biatch", "bloody", "blowjob", "blow job", "boner", "boob", "butt", "buttplug", "clitoris", "cock", "coon", "crap", "cunt", "damn", "dick", "dildo", "fag", "feck", "fellate", "fellatio", "felching", "fuck", "f u c k", "homo", "jerk", "jizz", "labia", "lmao", "lmfao", "muff", "nigger", "nigga", "penis", "piss", "poop", "prick", "pube", "pussy", "queer", "scrotum", "sex", "shit", "s hit", "sh1t", "slut", "spunk", "tit", "turd", "twat", "vagina", "wank", "whore", "wtf"];

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
  nowIs: function() {
    // ARGS: what, start, end
    // - 'after', '4:00 PM'
    // - 'between', '8:40 AM', '3:00 PM'
    var what = arguments[0];
    if(arguments[2]){
      var start = moment(arguments[1], "h:mm A");
      var end = moment(arguments[2], "h:mm A");
      return (moment().isBetween(start, end));
    }else{
      var time = moment(arguments[1], "h:mm A");

      if(what == "after")
        return (moment().isAfter(time));
      else if(what == "before")
        return (moment().isBefore(time));
      else
        return false;
    }
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
      var searchMask = word+" ";
      var regEx = new RegExp(searchMask, "ig");
      var replaceMask = "****";

      //str = str.replace(regEx, replaceMask);
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
    //console.log(word +" vs "+other + " == "+(word.indexOf(other) > -1));
    return (word.indexOf(other) > -1);
  },
  isReach: function(department) {
    return (department.indexOf("REACH") > -1);
  },
  advisor: function(adv) {
    for (var key in adv.teacher) {
      //console.log(key, adv.teacher[key]);
    }
    return adv.teacher.toJSON();
  },
  isShort: function(p, n){
    //console.log(p || n);
    if(p || n)
      return "";
    else
      return "short";
  },
  makePeriodListItem: function(p) {
    var duration = -(moment(p.startTime, "hh:mm a").diff(moment(p.endTime, "hh:mm a"), 'minutes'));
    var room = p.room.replace("Anywhere", "").replace("Auditorium - Front", "").replace("Cafeteria", "");

    var className = p.className.split("(")[0].trim();
    if(className.length > 12){
      className = p.className.slice(0, 12)+"...";
    }

    [' 9', ' 10', ' 11', ' 12'].forEach(function(grade) {
      className = className.replace(grade, "");
    });

    if(p.startTime.charAt(0) == "0")
      p.startTime = p.startTime.substring(1);

    if(p.endTime.charAt(0) == "0")
      p.endTime = p.endTime.substring(1);

    var span = p.startTime +" to "+p.endTime+"<br>";

    var returning = [];
    returning.push("<li data-mID='"+p.mID+"' title='"+span+room+"' data-toggle='tooltip' class='"+(p.className=="Lunch" || p.room == "Anywhere" ? "disabled" : "")+" list-group-item'>");
    if(p.mID)
      returning.push("<a style='text-decoration: none;' target='_blank' href='http://moodle.regis.org/course/view.php?id="+p.mID+"' class='undecorated'>"+className+"</a>");
    else
      returning.push(className);
    returning.push("<small class='right text-muted'>"+duration+"m</small></li>");

    return returning.join("");
  }
}
