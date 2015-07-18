var express = require('express');
var router = express.Router();

router.get("/", function(req, res, next) {
  req.toJade.title = "Teachers";
  req.toJade.teachers = false;

  var sortBy = (req.query.sortBy ? req.query.sortBy : "");
  req.Teacher.find({}).sort(sortBy).exec(function(err, teachers) {
    if(err) throw err;

    if(teachers){
      req.toJade.teachers = teachers;
    };
    req.toJade.sortBy = sortBy;
    res.render('teachers/list', req.toJade);
  });
});

router.get("/:mID", function(req, res, next) {
  var mID = req.params.mID;
  req.toJade.teacher = false;

  req.Teacher.findOne({mID: mID}, function(err, teacher) {
    if(err) throw err;

    if(teacher) {
      req.toJade.title = "Teacher "+teacher.fullName;
      req.toJade.teacher = teacher;
    }
    res.render('teachers/profile', req.toJade);
  });
});

router.get("/:tID/schedule", function(req, res, next) {
  var tID = req.params.tID;
  req.toJade.teacher = false;

  req.Teacher.findOne({tID: tID}, function(err, teacher) {
    if(err) throw err;

    if(teacher) {
      req.toJade.title = "Teacher "+teacher.firstName.charAt(0)+". "+teacher.lastName;
      req.toJade.teacher = teacher;
    }
    res.render('teachers/profile', req.toJade);
  });
});

module.exports.models = ['Teacher'];
module.exports.router = router;
