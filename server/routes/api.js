var express = require('express');
var router = express.Router();
var moment = require('moment');
var utils = require("../modules/utils");

router.get("/*", function(req, res, next) {
  if(req.loggedIn)
    next();
  else
    res.json({error: "Not authorized."});
});

router.get('/user/:username', function(req, res) {
  var username = req.params.username;
  req.Student.findOne({username: username}, 'username firstName lastName rank bio ipicture points mpicture scheduleArray registered advisement')
    .lean()
    .exec(function(err, user) {
      if(err) res.json({error: err});
      if(user){
        user.sInfo = (user.registered ? utils.getDayScheduleInfo(user.scheduleArray) : false);
        user.scheduleArray = [];
        res.json(user);
      }else{
        res.json({error: "No such user!"});
      }
    });
});

router.get('/teacher/:username', function(req, res) {
  var username = req.params.username;
  req.Teacher.findOne({username: username}).populate('courses', 'title mID').exec(function(err, teacher) {
    if(err) res.json({error: err});

    if(teacher){
      teacher.ratingStringJSON = String(teacher.ratingString);
      console.log("LOOK: "+teacher);
      res.json(teacher);
    }else{
      res.json({error: "No such teacher!"});
    }
  });
});


router.get('/work/:date', function(req, res) {
  var dateString = req.params.date;

  if(moment(dateString, 'YYYY-MM-DD', true).isValid() == false){
    res.json({error: "Invalid date!"});
  }else{
    var date = moment(dateString, 'YYYY-MM-DD', true);
    req.Day.findOne({username: req.currentUser.username, date: date.toDate()})
      .deepPopulate('items.homework items.tests items.quizzes items.essays')
      .exec(function(err, day) {
        if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
        if(day){
          day.deepPopulate('items.homework.course items.tests.course items.quizzes.course items.essays.course', {
            whitelist: ['_id', 'students']
          }, function(err, day) {
            //console.log(day);
            res.json({work: day.items});
          });
        }else{
          res.json({error: "No such day!"});
        }
      });
  }

});

router.post("/feedback/send", function(req, res) {
  var feedbackType = req.body.feedbackType;
  var text = req.body.text;
  if(text && feedbackType){
    console.log(feedbackType + " " + text);
    new req.Feedback({
      feedbackType: feedbackType,
      text: text
    }).save(function(err, fb) {
      if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
      res.json({success: true});
      console.log(fb);
    });
  }else{
    res.end("Not enough info.");
  }
});

module.exports = function(io) {
  return {router: router, models: ['Student', 'Teacher', 'Day', 'GradedItem', 'Feedback']}
};
