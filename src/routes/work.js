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
      grade = "Sophmore";
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
  req.Day.getClosest(req.currentUser.username, req.today, function(err, day) {
    if(err) throw err;

    if(day){
      res.redirect("/work/"+moment(day.date).format("YYYY-MM-DD"));
    }else{
      res.redirect("/work/today");
    }
  });
});

router.get("/today", function(req, res) {
  res.redirect("/days/"+moment().format("YYYY-MM-DD"));
});

router.get("/:date", function(req, res, next) {
  var dateString = req.toJade.dateString = req.params.date;
  req.toJade.day = false;
  req.toJade.date = false;
  req.toJade.isToday = (dateString == req.today.format("YYYY-MM-DD"));

  if(moment(dateString, 'YYYY-MM-DD', true).isValid() == false){
    req.toJade.title = "Invalid Date";
    res.render('work/one', req.toJade);
  }else{
    var date = req.toJade.date = moment(dateString, 'YYYY-MM-DD', true);
    req.toJade.title = date.format("dddd, MMM Do YY");
    req.toJade.items = false;
    req.toJade.hwTitles = [];

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

    req.toJade.next = date.add(1, 'days').format('YYYY-MM-DD');
    // We subtract 2 since we just added one above
    req.toJade.previous = date.subtract(2, 'days').format('YYYY-MM-DD');
    req.toJade.date = date.add(1, 'days');

    req.Day.findOne({username: req.currentUser.username, date: date.toDate()}).deepPopulate('items.homework').exec(function(err, day) {
      if(err) throw err;
      console.log(date.toDate());
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

          console.log(req.toJade.hwcourses);
          req.toJade.items = d.items;
        });
      }else{
        console.log("Did not find day");
      }
      res.render('work/one', req.toJade);
    });
  }
});

module.exports = function(io) {
  return {router: router, models: ['Day', 'HWItem', 'Course']}
};
