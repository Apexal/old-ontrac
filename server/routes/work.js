var express = require('express');
var router = express.Router();
var moment = require('moment');

/* ----------------------------- */
/*         GET REQUESTS          */
/* ----------------------------- */

router.get('/', function(req, res) {

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
  req.toJade.days = false;

  req.Day.find({username: req.currentUser.username, date: {$lt: moment(req.today).add(5, 'days').toDate()}})
    .sort({date: -1})
    .exec(function(err, days) {
      console.log(days);
      if(err) console.log(err);
      if(days){
        req.toJade.days = days;
      }
      res.render('work/index', req.toJade);
    });

});

router.get(['/closest'], function(req, res) {
  var start = moment();
  var count = 0;
  var sDays = req.currentUser.scheduleObject.scheduleDays;
  while(count < 50){
    if(sDays[start.format("MM/DD/YY")] !== undefined){
      res.redirect("/work/"+start.format("YYYY-MM-DD"));
      return;
    }
    start.add(1, 'days');
    count++;
  }
  res.redirect("/work/today");
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
    req.session.errors.push("Bad date.");
    res.redirect('/work');
    return;
  }

  // Good date
  var date = req.toJade.date = moment(dateString, 'YYYY-MM-DD', true);
  req.toJade.title = date.format("dddd, MMM Do YY");
  req.toJade.items = false;

  if(req.currentUser.scheduleObject.scheduleDays[date.format("MM/DD/YY")] == undefined){
    req.session.info.push("Redirected to closest school day.");
    // Passed date is not a school, day try to find the next one
    console.log("Not school day, finding closest one.");
    var count = 0;
    var last = moment(date);
    while(count < 50){
      last.add(1, 'days');
      if(req.currentUser.scheduleObject.scheduleDays[last.format("MM/DD/YY")]){
        res.redirect('/work/'+last.format("YYYY-MM-DD"));
        return;
      }
      count++;
    }

    var count = 50;
    var last = moment(date);
    while(count > 0){
      last.subtract(1, 'days');
      if(req.currentUser.scheduleObject.scheduleDays[last.format("MM/DD/YY")]){
        res.redirect('/work/'+last.format("YYYY-MM-DD"));
        return;
      }
      count--;
    }
  }
  req.toJade.scheduleDay = req.currentUser.scheduleObject.scheduleDays[date.format("MM/DD/YY")];

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
  req.toJade.next = moment(date).add(1, 'days').format('YYYY-MM-DD');
  if(req.currentUser.scheduleObject.scheduleDays[moment(date).add(1, 'days').format('MM/DD/YY')] == undefined){
    // find the previous work day
    console.log("Next day is not 1 ahead.");
    var count = 0;
    var last = moment(date);
    var found = false;
    while(count < 50 && found == false){
      last.add(1, 'days');
      //console.log(last.format("MM/DD/YY"));
      if(req.currentUser.scheduleObject.scheduleDays[last.format("MM/DD/YY")]){
        req.toJade.next = last.format("YYYY-MM-DD");
        found = true;
      }
      count++;
    }
  }
  req.toJade.previous = moment(date).subtract(1, 'days').format('YYYY-MM-DD');
  if(req.currentUser.scheduleObject.scheduleDays[moment(date).subtract(1, 'days').format('MM/DD/YY')] == undefined){
    // find the previous work day
    console.log("Previous day is not 1 back.");
    var count = 50;
    var last = moment(date);
    var found = false;
    while(count > 0 && found == false){
      last.subtract(1, 'days');
      //console.log(last.format("MM/DD/YY"));
      if(req.currentUser.scheduleObject.scheduleDays[last.format("MM/DD/YY")]){
        req.toJade.previous = last.format("YYYY-MM-DD");
        found = true;
      }
      count--;
    }
  }

  req.toJade.hwTitles = false;

  req.Day.findOne({username: req.currentUser.username, date: date.toDate()})
    .deepPopulate('items.homework')
    .exec(function(err, day) {
      if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}

      if(day){
        console.log("Found day");
        day.deepPopulate(['items.homework.course', 'mID title'], function(err, d) {
          req.toJade.day = d;
          //console.log(d.items);
          var cTitles = [];
          var organized = {};
          d.items.homework.forEach(function(item){
              var cTitle = item.course.title;

              if(organized[cTitle] == null){
                 organized[cTitle] = [item];
                 cTitles.push(cTitle);
              }else{
                  organized[cTitle].push(item);
              }
          });
          req.toJade.hwTitles = cTitles;
          req.toJade.homework = organized;

          //console.log(req.toJade);
          req.toJade.items = d.items;
          res.render('work/one', req.toJade);
        });
      }else{
        console.log("No such day.");
        //console.log(req.toJade);
        res.render('work/one', req.toJade);
      }
    });
});

module.exports = function(io) {
  return {router: router, models: ['Day', 'HWItem', 'Course']}
};
