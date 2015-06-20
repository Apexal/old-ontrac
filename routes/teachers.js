var express = require('express');
var router = express.Router();

router.get("/:tID", function(req, res, next) {
  var tID = req.params.tID;

  req.Teacher.findOne({tID: tID}, function(err, teacher) {
    if(err) console.log(err);

    req.toJade.found = false;
    if(teacher) {
      req.toJade.found = true;
      req.toJade.title = "Teacher "+teacher.firstName.charAt(0)+". "+teacher.lastName;
      req.toJade.teacher = teacher;
    }
    res.render('teachers/profile', req.toJade);
  });
});

module.exports = router;
