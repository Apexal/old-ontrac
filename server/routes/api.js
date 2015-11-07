var express = require('express');
var router = express.Router();
var moment = require('moment');
var schedules = require('../modules/schedule');
var filter = require("../modules/utils").filter;

router.get("/*", function(req, res, next) {
  if(req.loggedIn)
    next();
  else
    res.json({error: "Not authorized."});
});

router.get('/user/:username', function(req, res) {
  var username = req.params.username;
  req.Student.findOne({username: username}, 'username firstName lastName rank bio ipicture points mpicture scheduleObject registered advisement')
    .lean()
    .exec(function(err, user) {
      if(err){res.json({error: err}); return;};
      if(user){
        if(user.registered){
          var sd = user.scheduleObject.scheduleDays[moment().format("MM/DD/YY")];
          if(sd){
            //console.log(user.scheduleObject.dayClasses);
            user.todaysClassesInfo = {scheduleDay: sd, periods: user.scheduleObject.dayClasses[sd], currentInfo: schedules.getCurrentClassInfo(user.scheduleObject.dayClasses[sd])};
          }
        }
        res.json(user);
      }else{
        res.json({error: "No such user!"});
      }
    });
});

router.get('/teacher/:username', function(req, res) {
  var username = req.params.username;
  req.Teacher.findOne({username: username}).populate('courses', 'title').exec(function(err, teacher) {
    if(err){res.json({error: err}); return;};
    if(teacher){
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
    .populate('teacher', 'firstName lastName username ipicture mpicture')
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
