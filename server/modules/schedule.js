var moment = require("moment");

var fillPeriods = function(day){
  var dayStart = moment(day.date).hour(8).minute(40);
  var dayEnd = moment(day.date).hour(14).minute(50);

  var periods = day.periods;
  var filledPeriods = [];
  var lastPeriod = {};

  if(periods[0].className !== "AM Advisement"){
    filledPeriods.push({
      room: "Your Homeroom",
      startTime: dayStart.toDate(),
      endTime: moment(day.date).hour(8).minute(50).toDate(),
      className: "AM Advisement"
    });
  }
  periods.forEach(function(period) {
    var cur = period;

    if(moment(period.startTime).isSame(lastPeriod.endTime) == false && periods.indexOf(period) > 0){
      filledPeriods.push({
        room: "Anywhere",
        startTime: lastPeriod.endTime,
        endTime: period.startTime,
        className: "Unstructured Time"
      });
    }

    lastPeriod = period;
    filledPeriods.push(cur);
  });

  if(moment(periods[periods.length-1].endTime).isSame(dayEnd) == false){
    filledPeriods.push({
      room: "Anywhere",
      startTime: lastPeriod.endTime,
      endTime: dayEnd.toDate(),
      className: "Unstructured Time"
    });
  }
  // I am a genius for this ^^^

  if(periods[periods.length-1].className !== "PM Advisement"){
    filledPeriods.push({
      room: "Your Homeroom",
      startTime: dayEnd.toDate(),
      endTime: moment(dayEnd).add(5, 'minutes').toDate(),
      className: "PM Advisement"
    });
  }
  day.periods = filledPeriods;
  return day;
};

var getDaySchedule = function(schedule, dateString){
  var day = schedule[dateString];

  if(day)
    return fillPeriods(day);
  return false;
};

// Return an the scheduleobject for today with the periods filled in.
var getCurrentClassInfo = function(schedule){
  var mom = moment();
  var day = getDaySchedule(schedule, mom.format("MM/DD/YY"));
  var dayStart = moment("08:40 AM", "hh:mm A");
  var dayEnd = moment("02:50 PM", "hh:mm A");

  var periods = day.filledPeriods;
  var newPeriods = [];

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
      if(mom.isBetween(period.startTime, period.endTime)){
        return true;
      }
      return false;
    });
    if(now.length >= 1) now = now[0];
    // If there is no such period (and it is during the school day)

    // Try to find a class that just ended
    var cur = mom;
    var found = periods.filter(function(period) {
      if(cur.isSame(period.endTime)){
        return true;
      }
      return false;
    });
    if(found.length == 1){ justEnded = found[0];}else{justEnded = false;}
    // If none found set to false

    // Try to find a class that just started
    var found = periods.filter(function(period) {
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
  fillPeriods: fillPeriods,
  getDaySchedule: getDaySchedule,
  getCurrentClassInfo: getCurrentClassInfo
}
