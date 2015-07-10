var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
  req.toJade.title = "Courses";

  req.Course.find({}).populate('teacher').exec(function(err, courses){
    if(err) throw err;
    req.toJade.courses = courses;
    res.render('courses/list', req.toJade);
  });
});

router.get('/:mID', function(req, res) {
  var mID = req.params.mID;
  req.toJade.title = "Course "+mID;

  req.Course.findOne({mID: mID}).populate('teacher').exec(function(err, course){
    if(err) throw err;
    req.toJade.course = 0;

    if(course){
      req.toJade.course = course;
    }
    res.render('courses/one', req.toJade);
  });
});

module.exports = router;
