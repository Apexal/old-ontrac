var express = require('express');
var router = express.Router();
var moment = require('moment');
var schedules = require('../modules/schedule');
var filter = require("../modules/utils").filter;
var api_token = require("../secrets.json").api_token;

router.get('/loggedIn', function(req, res) {
  if(!req.loggedIn){
    res.json({error: "Not logged in!"}); return;
  }
  var u = req.currentUser;
  var sd = u.scheduleObject.scheduleDays[moment().format("YYYY-MM-DD")];
  if(sd){
    //console.log(user.scheduleObject.dayClasses);
    u.todaysClassesInfo = {scheduleDay: sd, periods: u.scheduleObject.dayClasses[sd], currentInfo: schedules.getCurrentClassInfo(u.scheduleObject.dayClasses[sd])};
  }
  res.json(u);
});


router.get('/teacher/:username', function(req, res) {
  var username = req.params.username;
  req.Teacher.findOne({username: username}).populate('courses', 'title mID').exec(function(err, teacher) {
    if(err){res.json({error: err}); return;};
    if(teacher){
      teacher = teacher.toObject({virtuals: true});
      teacher.ratingStringJSON = String(teacher.ratingString);
      //console.log("LOOK: "+teacher);
      res.json(teacher);
    }else{
      res.json({error: "No such teacher!"});
    }
  });
});

router.get('/course/:mID', function(req, res) {
  var mID = req.params.mID;
  req.Course.findOne({mID: mID})
    .populate('teacher', 'mID firstName lastName username ipicture mpicture')
    .exec(function(err, course){
      if(err){res.json({error: err}); return;};
      if(course){
        res.json(course);
      }else{
        res.json({error: "No such course!"});
      }
    });
});

router.post("/feedback/send", function(req, res) {
  var feedbackType = req.body.feedbackType;
  var text = req.body.text;
  if(text && feedbackType){
    console.log(feedbackType + " " + text);
    new req.Feedback({
      feedbackType: feedbackType,
      text: filter(text)
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
  return {router: router, models: ['Student', 'Teacher', 'GradedItem', 'Feedback', 'Course']}
};
