var express = require('express');
var router = express.Router();
var moment = require('moment');
var _ = require('underscore');

/* ----------------------------- */
/*         GET REQUESTS          */
/* ----------------------------- */

router.get('/', function(req, res) {
  res.render('days/index', req.toJade);
});

router.get(['/closest'], function(req, res) {
  req.Day.getClosest(req.currentUser.username, req.today, function(err, day) {
    if(err) throw err;

    if(day){
      console.log("FOUND DAY");
      res.redirect("/days"+moment(day.date).format("YYYY-MM-DD"));
    }else{
      res.redirect("/days/today");
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
    res.render('days/one', req.toJade);
  }else{
    var date = req.toJade.date = moment(dateString, 'YYYY-MM-DD', true);
    req.toJade.title = date.format("dddd, MMM Do YY");
    req.toJade.items = false;

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
          //homework
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
          next();
        });
      }else{
        console.log("Did not find day");
        next();
      }
    });
  }
});

// The main day page
router.get('/:date', function(req, res) {
  res.render('days/one', req.toJade);
});

router.post('/:date/*', function(req, res, next) {
  var dateString = req.toJade.dateString = req.params.date;

  if(moment(dateString, 'YYYY-MM-DD', true).isValid()){
    var date = req.toJade.date = moment(dateString, 'YYYY-MM-DD', true);
    req.Day.findOne({username: req.currentUser.username, date: date.toDate()}, function(err, day) {
      if(err) throw err;
      console.log(date.toDate());
      if(day){
        req.toJade.day = day;
        // all good
        console.log("Found day");
      }else{
        console.log("Must make day");
        var sd = req.query.sd;
        var newDay = new req.Day();
        newDay.date = date.toDate();
        newDay.scheduleDay = sd;
        newDay.username = req.currentUser.username;
        newDay.items = {
          homework: [],
          tests : [],
          quizzes: [],
          projects: []
        };
        req.toJade.day = newDay;
      }
      next();
    });
  }else{
    console.log("Bad dateString");
    new req.Log({what: "Homework POST to invalid date", who: req.currentUser._id});
  }
});

router.post('/:date/homework', function(req, res) {
  console.log(req.toJade.dateString + " " + req.toJade.day.scheduleDay);
  console.log(req.body);

  if(req.body.newHWItemDesc){
    var desc = req.body.newHWItemDesc;
    var course = req.body.newHWItemCourse;

    req.Course.findOne({mID: course}, function(err, c) {
      if(err) throw err;

      if(course){
        var newHWItem = new req.HWItem({
          course: c._id,
          desc: desc,
          link: "",
          completed: false
        });

        req.toJade.day.items.homework.push(newHWItem._id);
        newHWItem.save(function(err) {
          if(err) throw err;
          console.log("SAVED HWITEM");
        });
        req.toJade.day.save(function(err) {
          if(err) throw err;
          console.log("SAVED");
        });
      }
      res.redirect('/days/'+req.toJade.dateString);
    });
  }else{
    res.redirect('/days/'+req.toJade.dateString);
  }
});

module.exports.models = ['Day', 'HWItem', 'Course'];
module.exports.router = router;
