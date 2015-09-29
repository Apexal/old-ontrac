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
      var ended = moment(period.endTime, "hh:mm A");
      var buffer = moment(ended).add(3, 'minutes'); // Start of next period with buffer time
      if(cur.isBetween(ended, buffer)){
        return true;
      }
      return false;
    });
    if(found.length == 1){ justEnded = found[0];}else{justEnded = false;}
    // If none found set to false

    // Did the current class just start?
    var started = moment(now.startTime, "hh:mm A");
    var buffer = moment(started).add(3, 'minutes');
    if(cur.isBetween(started, buffer)) justStarted = true;

    // If a class has just ended and another has just started, you are in between adjacent classes
    if(justStarted !== false && justEnded !== false){
      var index = periods.indexOf(justStarted) + 1;
      if(periods[index])
        now = periods[index];
    }

    // Get the next class
    next = ((periods.length-1 > periods.indexOf(now)) ? periods[periods.indexOf(now)+1] : false);

  }

  return {
    nowClass: now, // object of current class | false
    nextClass: next, // object of next class | false
    justStarted: justStarted, // boolean stating whether current class just started | false
    justEnded: justEnded, // object of class that just ended | false
    inSchool: inSchool // boolean stating whether the current time is during school hours
  };
};

function getNextDay(day, sO){
  var current = moment(day).add(1, 'days');
  var count = 0;
  while(count < 50){
    if(sO.scheduleDays[current.format("MM/DD/YY")] !== undefined){
      return current.format("MM/DD/YY");
    }
    current.add(1, 'days');
    count++;
  }
  return false;
}

function getPrevDay(day, sO){
  var current = moment(day).subtract(1, 'days');
  var count = 50;
  while(count > 0){
    if(sO.scheduleDays[current.format("MM/DD/YY")] !== undefined){
      return current.format("MM/DD/YY");
    }
    current.subtract(1, 'days');
    count--;
  }
  return false;
}

module.exports = {
  getCurrentClassInfo: getCurrentClassInfo,
  getNextDay: getNextDay,
  getPrevDay: getPrevDay
}
