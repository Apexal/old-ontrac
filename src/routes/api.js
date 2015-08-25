var express = require('express');
var router = express.Router();
var moment = require('moment');

router.get("/*", function(req, res, next) {
  if(req.loggedIn)
    next();
  else
    res.end("Not authorized.");
});

router.get('/user/:username', function(req, res) {
  var username = req.params.username;
  req.Student.findOne({username: username}).populate('courses', 'title mID').exec(function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
});

router.get('/teacher/:username', function(req, res) {
  var username = req.params.username;
  req.Teacher.findOne({username: username}).populate('courses', 'title mID').exec(function(err, teacher) {
    if (err)
      res.send(err);

    teacher.ratingStringJSON = String(teacher.ratingString);
    console.log("LOOK: "+teacher);
    res.json(teacher);
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
        if (err) throw err;
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

module.exports = function(io) {
  return {router: router, models: ['Student', 'Teacher', 'Day', 'GradedItem']}
};
