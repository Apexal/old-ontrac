var express = require('express');
var router = express.Router();

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
  req.Teacher.findOne({email: username+"@regis.org"}).populate('courses', 'title mID').exec(function(err, teacher) {
    if (err)
      res.send(err);
    res.json(teacher);
  });
});

module.exports = function(io) {
  return {router: router, models: ['Student', 'Teacher']}
};
