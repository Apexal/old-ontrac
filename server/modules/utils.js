// A bunch of helper functions (mainly for Jade)
var moment = require("moment");
// The site I found this on was British, can you tell?
var words = ["anal", "anus", "arse", "ass", "ballsack", "balls", "bastard", "bitch", "biatch", "bloody", "blowjob", "blow job", "bollock", "bollok", "boner", "boob", "bugger", "bum", "butt", "buttplug", "clitoris", "cock", "coon", "crap", "cunt", "damn", "dick", "dildo", "dyke", "fag", "feck", "fellate", "fellatio", "felching", "fuck", "f u c k", "fudgepacker", "fudge packer", "flange", "Goddamn", "God damn", "hell", "homo", "jerk", "jizz", "knobend", "knob end", "labia", "lmao", "lmfao", "muff", "nigger", "nigga", "omg", "penis", "piss", "poop", "prick", "pube", "pussy", "queer", "scrotum", "sex", "shit", "s hit", "sh1t", "slut", "smegma", "spunk", "tit", "tosser", "turd", "twat", "vagina", "wank", "whore", "wtf"];

module.exports = {
  getDayScheduleInfo: function(array){
    var mom = moment();
    var dayStart = moment("08:40 AM", "hh:mm A");
    var dayEnd = moment("02:50 PM", "hh:mm A");

    /* TESTING
      var day = "09/24/15";
      mom = moment(day+" 09:51 AM", "MM/DD/YY hh:mm A");
      dayStart = moment(day+" 08:40 AM", "MM/DD/YY hh:mm A");
      dayEnd = moment(day+" 02:50 PM", "MM/DD/YY hh:mm A");
    */

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

        // Free periods are not recorded, so find the holes and fill them
        var newTodays = [];
        var lastPeriod = {};
        todays.forEach(function(period) {
          var cur = period;

          if(moment(period.startTime).isSame(lastPeriod.endTime) == false && todays.indexOf(period) > 0){
            newTodays.push({
              date: period.date,
              room: "Anywhere",
              startTime: lastPeriod.endTime,
              endTime: period.startTime,
              className: "Unstructured Time"
            });
          }

          lastPeriod = period;
          newTodays.push(cur);
        });

        if(moment(todays[todays.length-1].endTime).isSame(dayEnd) == false){
          newTodays.push({
            date: lastPeriod.date,
            room: "Anywhere",
            startTime: lastPeriod.endTime,
            endTime: dayEnd.toDate(),
            className: "Unstructured Time"
          });
        }
        // I am a genius for this ^^^


        todays = newTodays; // Free periods are now in array


        // Loop through today's classes to find the currently ongoing
        now = todays.filter(function(period) {
          if(mom.isBetween(period.startTime, period.endTime)){
            return true;
          }
          return false;
        });
        if(now.length == 1) now = now[0];
        // If there is no such period (and it is during the school day)

        // Try to find a class that just ended
        var cur = mom;
        var found = todays.filter(function(period) {
          if(cur.isSame(period.endTime)){
            return true;
          }
          return false;
        });
        if(found.length == 1){ justEnded = found[0];}else{justEnded = false;}
        // If none found set to false

        // Try to find a class that just started
        var found = todays.filter(function(period) {
          if(cur.isSame(period.startTime)){
            return true;
          }
          return false;
        });
        if(found.length == 1){ justStarted = found[0];}else{justStarted = false;}
        // If none set to false

        // If a class jas just ended and another jas just started, you are in between adjacent classes
        if(justStarted !== false && justEnded !== false){
          now = "between";
        }

        // Get the next class
        if(now !== "between")
          next = ((todays.length-1 > todays.indexOf(now)) ? todays[todays.indexOf(now)+1] : false);
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
