var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
  req.toJade.title = "Courses";

  req.Course.find({}, function(err, courses){
    if(err) throw err;

    

    req.toJade.courses = courses;
    res.render('courses/list', req.toJade);
  });
});

module.exports = router;
