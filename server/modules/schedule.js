var moment = require("moment");

module.exports = function(schedule){
  var mom = moment();
  var dayStart = moment("08:40 AM", "hh:mm A");
  var dayEnd = moment("02:50 PM", "hh:mm A");

  var day = schedule[moment().format("MM/DD/YY")];
  var periods = (day.periods.length > 0 ? day.periods : false);

  var now = false;
  var next = false;

  var justEnded = false;
  var justStarted = false;

  var inSchool = true;

  if(mom.isBetween(dayStart, dayEnd)){
    // RIGHT NOW IS IN A SCHOOL DAY
    //console.log("IN SCHOOL DAY");

    if(periods !== false){
      // THERE ARE CLASSES SCHEDULE FOR TODAY

      // Free periods are not recorded, so find the holes and fill them
      var newPeriods = [];
      var lastPeriod = {};
      newPeriods.push({
        room: "Your Homeroom",
        startTime: dayStart.toDate(),
        endTime: moment(mom).hour(8).minute(50).toDate(),
        className: "AM Advisement"
      });
      periods.forEach(function(period) {
        var cur = period;

        if(moment(period.startTime).isSame(lastPeriod.endTime) == false && periods.indexOf(period) > 0){
          newPeriods.push({
            room: "Anywhere",
            startTime: lastPeriod.endTime,
            endTime: period.startTime,
            className: "Unstructured Time"
          });
        }

        lastPeriod = period;
        newPeriods.push(cur);
      });

      if(moment(periods[periods.length-1].endTime).isSame(dayEnd) == false){
        newPeriods.push({
          room: "Anywhere",
          startTime: lastPeriod.endTime,
          endTime: dayEnd.toDate(),
          className: "Unstructured Time"
        });
      }
      // I am a genius for this ^^^

      newPeriods.push({
        room: "Your Homeroom",
        startTime: dayEnd.toDate(),
        endTime: moment(dayEnd).add(5, 'minutes').toDate(),
        className: "PM Advisement"
      });

      periods = newPeriods; // Free periods are now in array

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
  }else{
    now = false;
    inSchool = false;
    // NOT IN SCHOOL
  }

  return {
    day: day,
    inSchool: inSchool,
    todays: periods,
    nowClass: now,
    nextClass: next,
    justEnded: justEnded,
    justStarted: justStarted
  }
};
