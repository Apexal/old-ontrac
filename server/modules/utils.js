// A bunch of helper functions (mainly for Jade)
var moment = require("moment");
// The site I found this on was British, can you tell?
var words = ["anal", "anus", "arse", "ass", "ballsack", "balls", "bastard", "bitch", "biatch", "bloody", "blowjob", "blow job", "bollock", "bollok", "boner", "boob", "bugger", "bum", "butt", "buttplug", "clitoris", "cock", "coon", "crap", "cunt", "damn", "dick", "dildo", "dyke", "fag", "feck", "fellate", "fellatio", "felching", "fuck", "f u c k", "fudgepacker", "fudge packer", "flange", "Goddamn", "God damn", "hell", "homo", "jerk", "jizz", "knobend", "knob end", "labia", "lmao", "lmfao", "muff", "nigger", "nigga", "omg", "penis", "piss", "poop", "prick", "pube", "pussy", "queer", "scrotum", "sex", "shit", "s hit", "sh1t", "slut", "smegma", "spunk", "tit", "tosser", "turd", "twat", "vagina", "wank", "whore", "wtf"];

module.exports = {
  getDayScheduleInfo: function(array){
    var day = "09/24/15";
    var mom = moment(day+" 09:30 AM", "MM/DD/YY hh:mm A");
    var dayStart = moment(day+" 08:40 AM", "MM/DD/YY hh:mm A");
    var dayEnd = moment(day+" 02:50 PM", "MM/DD/YY hh:mm A");

    var todays = array.filter(function(period) {
      if(moment(period.date).isSame(moment(mom).startOf('day'))){
        //console.log(period.className+":\n"+moment(period.startTime).toDate()+"\n"+moment(period.endTime).toDate())
        return true;
      }
      return false;
    });
    todays = (todays.length > 0 ? todays : false);

    var now = false;
    var next = false;

    var justEnded = false;
    var justStarted = false;

    if(mom.isBetween(dayStart, dayEnd)){
      // RIGHT NOW IS IN A SCHOOL DAY
      //console.log("IN SCHOOL DAY");

      if(todays !== false){
        // THERE ARE CLASSES SCHEDULE FOR TODAY

        now = todays.filter(function(period) {
          if(mom.isBetween(period.startTime, period.endTime)){
            return true;
          }
          return false;
        });
        if(now.length == 1) now = now[0]; else now = "free";
        // IF NO CLASS NOW, IN A FREE PERIOD

        var cur = mom;
        var found = todays.filter(function(period) {
          if(cur.isSame(period.endTime)){
            return true;
          }
          return false;
        });
        if(found.length == 1){ justEnded = found[0];}else{justEnded = false;}
        var found = todays.filter(function(period) {
          if(cur.isSame(period.startTime)){
            return true;
          }
          return false;
        });
        if(found.length == 1){ justStarted = found[0];}else{justStarted = false;}

        while(cur.isBefore(dayEnd) && next == false){
          cur.add(20, 'minutes');
          var found = todays.filter(function(period) {
            if(cur.isBetween(period.startTime, period.endTime)){
              return true;
            }
            return false;
          });
          if(found.length > 0){ next = found[0]; break;}else{next = "free";}
        }

      }
    }else{
      now = false;
      // NOT IN SCHOOL
      //console.log("OUT OF SCHOOL DAY");
    }

    //console.log(now);
    //console.log(next);


    return {
      todays: todays,
      nowClass: now,
      nextClass: next,
      justEnded: justEnded,
      justStarted: justStarted
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
  },
  isShort: function(p, n){
    console.log(p || n);
    if(p || n)
      return "";
    else
      return "short";
  },
  fromNow: function(date) {
    var today = moment().startOf('day');
    if(date.isSame(today)){
      return "today";
    }else{
      return date.from(today);
    }
  }

}
