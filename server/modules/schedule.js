var moment = require("moment");

// Return an the scheduleobject for today with the periods filled in.
var getCurrentClassInfo = function(periods){
  var mom = moment();
  var dayStart = moment("08:40 AM", "hh:mm A");
  var dayEnd = moment("02:50 PM", "hh:mm A");

  var now = false;
  var next = false;
  var justEnded = false;
  var justStarted = false;
  var inSchool = false;

  if(periods !== false && mom.isBetween(dayStart, dayEnd)){
    inSchool = true;
    // THERE ARE CLASSES SCHEDULED FOR TODAY

    // Loop through today's classes to find the currently ongoing
    now = periods.filter(function(period) {
      if(mom.isBetween(moment(period.startTime, "hh:mm A"), moment(period.endTime, "hh:mm A"))){
        return true;
      }
      return false;
    });
    if(now.length >= 1) now = now[0];
    // If there is no such period (and it is during the school day)

    // Try to find a class that just ended
    var cur = mom;
    var found = periods.filter(function(period) {
      if(cur.isSame(moment(period.endTime, "hh:mm A"))){
        return true;
      }
      return false;
    });
    if(found.length == 1){ justEnded = found[0];}else{justEnded = false;}
    // If none found set to false

    // Try to find a class that just started
    var found = periods.filter(function(period) {
      if(cur.isSame(moment(period.startTime, "hh:mm A"))){
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
      next = ((periods.length-1 > periods.indexOf(now)) ? periods[periods.indexOf(now)+1] : false);

  }

  return {
    nowClass: now,
    nextClass: next,
    justStarted: justStarted,
    justEnded: justEnded,
    inSchool: inSchool
  };
};

module.exports = {
  getCurrentClassInfo: getCurrentClassInfo
}
