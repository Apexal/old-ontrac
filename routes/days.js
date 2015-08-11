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




router.post('/toggle', function(req, res) {
  var id = req.body.id;
  req.HWItem.findOne({_id: id}, function(err, item) {
    if(err) throw err;
    if(item){
      item.completed = !item.completed;
      item.save();
      res.json({message: "All good!"});
    }else{
      res.json({message: "Couldn't find and HWItem with ID "+id});
    }
  });
});



router.post('/remove', function(req, res) {
  var date = req.body.date;
  if(moment(date, 'YYYY-MM-DD', true).isValid()){
    if(req.body.removeHWItemID){
      var id = req.body.removeHWItemID;
      req.HWItem.findOne({_id: id}).remove(function(err) {
        if(err) throw err;
        req.Day.findOne({date: moment(date, 'YYYY-MM-DD', true).toDate()}, function(err, day) {
          if(err) throw err;
          if(day){
            var hw = day.items.homework;
            var index = hw.indexOf(id);
            day.items.homework.splice(index, 1);
            day.save(function(err) {
              if(err) throw err;
              res.json({message: "Deleted!"});
              new req.Log({who: req.currentUser._id, what: "Deleted a HW Item."});
            });
          }else{
            res.json({message: "Couldn't find day."});
          }
        })
      });
    }
  }else{
    res.json({message: "Bad date."});
  }
});


router.post('/:date/*', function(req, res, next) {
  var dateString = req.toJade.dateString = req.params.date;

  if(moment(dateString, 'YYYY-MM-DD', true).isValid()){
    var date = req.toJade.date = moment(dateString, 'YYYY-MM-DD', true);
    req.Day.findOne({username: req.currentUser.username, date: date.toDate()}, function(err, day) {
      if(err) throw err;
      if(day){
        req.toJade.day = day;
      }else{
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
          req.toJade.day.save(function(err) {
            if(err) throw err;
            new req.Log({what: "Added HW Item", who: req.currentUser._id});
          });
        });

      }
      res.redirect('/days/'+req.toJade.dateString);
    });
  }
});

module.exports = function(io) {
  return {router: router, models: ['Day', 'HWItem', 'Course']}
};
