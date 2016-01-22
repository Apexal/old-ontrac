var moment = require("moment");
var getYear = require("./years").getCurrent;

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
    if(sO.scheduleDays[current.format("YYYY-MM-DD")] !== undefined){
      return current.format("YYYY-MM-DD");
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
    if(sO.scheduleDays[current.format("YYYY-MM-DD")] !== undefined){
      return current.format("YYYY-MM-DD");
    }
    current.subtract(1, 'days');
    count--;
  }
  return false;
}

function generateSchedule(text, tri, user){
  var thisYear = getYear();
  // text is the huge downloaded text file from the Intranet
  var scheduleLines = text.match(/[^\r\n]+/g);
  var allPeriods = [];
  var scheduleDays = [];
  var schedule = {
    scheduleDays: {

    },
    dayClasses: {
      'A': [],
      'B': [],
      'C': [],
      'D': [],
      'E': []
    }
  };

  scheduleLines.forEach(function(line) {
    var parts = line.split("\t");
    if(moment(parts[0], "MM/DD/YY").isValid()){
      parts[0] = moment(parts[0], "MM/DD/YY").format("YYYY-MM-DD");
      if(parts[4].indexOf(" Day") > -1){ // This line is stating a Schedule Day
        scheduleDays.push(parts);
        schedule.scheduleDays[parts[0]] = parts[4].replace(" Day", "");
      }else{
        parts.splice(2, 1)
        parts.splice(5, 4);
        allPeriods.push(parts);
      }
    }
  });
  var triStart = moment(thisYear.full.trimesters[tri-1], "YYYY-MM-DD");
  var triEnd = ( tri == 3 ? moment(thisYear.full.end, "YYYY-MM-DD") : moment(thisYear.full.trimesters[tri], "YYYY-MM-DD"));

  var triDates = [];
  var good = allPeriods.filter(function(p) {
    var date = moment(p[0], "YYYY-MM-DD");
    if(date.isAfter(triStart) && date.isBefore(triEnd)){
      if(triDates.indexOf(p[0]) == -1)
        triDates.push(p[0]);
      return true;
    }
    return false;
  });

  var days = {};

  good.forEach(function(p) {
    if(!days[p[0]])
      days[p[0]] = [];

    days[p[0]].push(p);
  });
  //console.log(days);
  ['A', 'B', 'C', 'D', 'E'].forEach(function(sd) {
    var daysWithSD = triDates.filter(function(date) {
      if(schedule.scheduleDays[date] == sd)
        return true;
      return false;
    });



    //console.log("\n"+sd+"-Day");
    var unfilled = days[daysWithSD[0]];
    //console.log(unfilled);
    var filled = fillPeriods(unfilled, user);
    schedule.dayClasses[sd] = filled;
  });
  //console.log((good.length/allPeriods.length)*100);

  return schedule;
}

var fillPeriods = function(unfilled, user){
  var filled = [];

  var amAdv = {
    startTime: '08:40 AM',
    endTime: '08:50 AM',
    className: 'Morning Advisement',
    duration: 10,
    room: 'Homeroom'
  };

  filled.push(amAdv);
  var lastPeriod = amAdv;
  unfilled.forEach(function(period) {
    if(!period.className){
      var room = (isNaN(period[4]) ? period[4] : "Room "+period[4]);
      period = {
        startTime: period[1],
        endTime: period[2],
        className: period[3],
        room: room
      };
    }
    if(lastPeriod.endTime !== period.startTime){
      // There is a gap! Fill it with a free period (or lunch)
      var room = "Anywhere";
      var cName = "Unstructured Time";
      var lunch = moment(lastPeriod.endTime, "hh:mm A").startOf('day').hour(11).minute(30);
      switch(user.grade){
        case 9:
        case 10:
          lunch = moment(lastPeriod.endTime, "hh:mm A").startOf('day').hour(11).minute(30);
          break;
        case 11:
        case 12:
          lunch = moment(lastPeriod.endTime, "hh:mm A").startOf('day').hour(12).minute(10);
          break;
      }

      if(moment(lastPeriod.endTime, "hh:mm A").isSame(lunch)){
        var lunchEnd = moment(lunch).add(40, 'minutes');
        filled.push({
          room: "Cafeteria",
          startTime: lunch.format("hh:mm A"),
          endTime: lunchEnd.format("hh:mm A"),
          duration: 40,
          className: "Lunch"
        });

        var nIndex = unfilled.indexOf(period) + 1;
        if(nIndex < unfilled.length){
          if(lunchEnd.isSame(unfilled[nIndex].startTime, "hh:mm A") == false){
            filled.push({
              room: "Anywhere",
              startTime: lunchEnd.format("hh:mm A"),
              endTime: unfilled[nIndex].startTime,
              duration: Math.abs(lunchEnd.diff(moment(unfilled[nIndex].startTime, "hh:mm A"), 'minutes')),
              className: "Unstructured Time"
            });
          }
        }
      }else{
        filled.push({
          room: "Anywhere",
          startTime: lastPeriod.endTime,
          endTime: period.startTime,
          duration: Math.abs(moment(lastPeriod.endTime, "hh:mm A").diff(moment(period.startTime, "hh:mm A"), 'minutes')),
          className: "Unstructured Time"
        });
      }
    }

    var myC = user.courses;
    myC.forEach(function(course) {
      if(period.className.trim().indexOf(course.title.trim()) > -1 || course.title.trim() == period.className.trim()){
        period.mID = course.mID;
      }else{
        //console.log("COULDN'T MATCH "+period.className + " TO COURSE");
      }
    });



    lastPeriod = period;
    filled.push(period);
  });

  // End of day free
  if(filled[filled.length-1].endTime !== "02:50 PM"){
   var duration = moment(lastPeriod.endTime, "hh:mm A").hour(14).minute(50).diff(moment(lastPeriod.endTime, "hh:mm A"), 'minutes');
   filled.push({
     room: "Anywhere",
     startTime: lastPeriod.endTime,
     endTime: "02:50 PM",
     duration: duration,
     className: "Unstructured Time"
   });
  }

  filled.push({
    startTime: '02:50 PM',
    endTime: '02:55 PM',
    duration: 20,
    className: 'Afternoon Advisement',
    room: 'Homeroom'
  });

  return filled;
}

module.exports = {
  getCurrentClassInfo: getCurrentClassInfo,
  getNextDay: getNextDay,
  getPrevDay: getPrevDay,
  generateSchedule: generateSchedule
}
