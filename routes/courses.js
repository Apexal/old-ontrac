var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
  req.toJade.title = "Courses";
  req.toJade.courses = false;

  req.Course.find({}).populate('teacher').populate('students', 'mID username firstName lastName registered').exec(function(err, courses){
    if(err) throw err;

    if(courses){
      req.toJade.courses = courses;
    }
    res.render('courses/list', req.toJade);
  });
});

router.get('/:mID', function(req, res) {
  var mID = req.params.mID;
  req.toJade.title = "Course "+mID;
  req.toJade.course = false;

  req.Course.findOne({mID: mID}).populate('teacher').populate('students', 'mID username advisement firstName lastName rank registered grade').exec(function(err, course){
    if(err) throw err;

    if(course){
      req.toJade.course = course;
    }
    res.render('courses/one', req.toJade);
  });
});

module.exports = function(io) {
  return {router: router, models: ['Course']}
};
