var express = require('express');
var router = express.Router();
var moment = require('moment');
var schedules = require('../modules/schedule');

/* ----------------------------- */
/*         GET REQUESTS          */
/* ----------------------------- */

router.get('/', function(req, res) {
  var nD = schedules.getNextDay(moment(), req.currentUser.scheduleObject);
  req.toJade.closestDay = nD;
  var adv = req.currentUser.advisement.charAt(0);
  var grade = "";
  switch(adv) {
    case "1":
      grade = "Freshman";
      break;
    case "2":
      grade = "Sophomore";
      break;
    case "3":
      grade = "Junior";
      break;
    case "4":
      grade = "Senior";
      break;
  }

  req.toJade.title = "Your "+grade+" Work";
  res.render('work/index', req.toJade);
});

router.get('/closest', function(req, res) {
  var nD = schedules.getNextDay(moment(), req.currentUser.scheduleObject);
  if(!nD){
    req.session.info.push("Cannot find the next class day!");
    res.redirect("/work");
    return;
  }else{
    res.redirect("/work/"+nD);
  }
});

router.get("/today", function(req, res) {
  res.redirect("/work/"+moment().format("YYYY-MM-DD"));
});

router.get('/:date', function(req, res){
  var dateString = req.toJade.dateString = req.params.date;
  req.toJade.day = false;
  req.toJade.date = false;
  req.toJade.isToday = (dateString == req.today.format("YYYY-MM-DD"));

  if(moment(dateString, 'YYYY-MM-DD', true).isValid() == false){
    // Bad date passed
    req.session.errs.push("Bad date.");
    res.redirect('/work');
    return;
  }

  // Good date
  var date = req.toJade.date = moment(dateString, 'YYYY-MM-DD', true);
  req.toJade.title = date.format("dddd, MMM Do YY");
  req.toJade.items = false;

  if(req.currentUser.scheduleObject.scheduleDays[dateString] == undefined){
    req.session.info.push("Redirected to closest school day.");
    // Passed date is not a school, day try to find the next one
    console.log("Not school day, finding closest one.");
    var nD = schedules.getNextDay(date, req.currentUser.scheduleObject);
    if(!nD){
      req.session.info.push("Cannot find the next class day!");
      res.redirect("/work");
      return;
    }else{
      res.redirect('/work/'+nd);
      return;
    }

    var pD = schedules.getPrevDay(date, req.currentUser.scheduleObject);
    if(!pD){
      req.session.info.push("Cannot find the previous class day!");
      res.redirect("/work");
      return;
    }else{
      res.redirect('/work/'+pD);
      return;
    }
  }
  req.toJade.scheduleDay = req.currentUser.scheduleObject.scheduleDays[dateString];

  // Get time from today to this date
  var diff = moment(date).diff(req.today, 'days');
  if(diff == 0)
    req.toJade.fromNow = "today";
  else if(diff == 1)
    req.toJade.fromNow = "tomorrow";
  else if(diff > 0)
    req.toJade.fromNow = diff+" days away";
  else if(diff == -1)
    req.toJade.fromNow = "yesterday";
  else
    req.toJade.fromNow = Math.abs(diff)+" days ago";

  // GET THE NEXT AND PREVIOUS DATES FOR THE DAY CONTROLS
  req.toJade.nextDay = schedules.getNextDay(date, req.currentUser.scheduleObject);
  req.toJade.previousDay = schedules.getPrevDay(date, req.currentUser.scheduleObject);

  var classes = req.currentUser.scheduleObject.dayClasses[req.toJade.scheduleDay];
  req.toJade.classes = classes;
  console.log(classes);
  res.render('work/one', req.toJade);
});



// CALENDAR EVENTS


router.get('/:date/events', function(req, res){
  var dateString = req.params.date;

  if(moment(dateString, 'YYYY-MM-DD', true).isValid() == false){
    res.json(null);
    return;
  }

  // Good date
  var date = moment(dateString, 'YYYY-MM-DD', true);

  if(req.currentUser.scheduleObject.scheduleDays[dateString] == undefined){
    res.json(null);
    return;
  }

  var events = [];

  req.HWItem.find({username: req.currentUser.username, date: date.toDate()})
    .populate('course', 'title')
    .lean()
    .exec(function(err, items){
      if(err){res.json(null); console.log(err); return;}
      if(items.length > 0){

        var hwTitles = [];
        var counts = {};
        var doneC = 0;
        var total = items.length;
        items.forEach(function(item){
          if(item.completed)
            doneC++;
          //console.log(item.course.title);
          if(hwTitles.indexOf(item.course.title) == -1)
            hwTitles.push(item.course.title);

          if(!counts[item.course.title])
            counts[item.course.title] = 0;
          counts[item.course.title] += 1;
        });

        var desc = [];
        hwTitles.forEach(function(title) {
          desc.push("<b>"+counts[title]+"</b> items for <i>"+title+"</i>");
        });

        var percent = Math.round((doneC/total)*100);

        var percentage = "";
        if(percent !== 100)
          percentage = " <small class='right'>"+percent+"%<span class='visible-xs'> Done</span></small>";

        events.push({
          title: "<span class='hidden-xs'>"+total+" Homework Items</span><span class='visible-xs'>"+total+" HW</span>"+percentage,
          start: dateString,
          color: '#9954bb',
          url: '/work/'+dateString,
          description: desc.join(', ')
        });
      }
    }).then(function() {
      res.json(events);
    });
});

module.exports = function(io) {
  return {router: router, models: ['HWItem', 'Course']}
};
