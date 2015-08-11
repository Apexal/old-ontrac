var express = require('express');
var router = express.Router();

router.get('/user/:username', function(req, res) {
  var username = req.params.username;
  req.Student.findOne({username: username}, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
});

module.exports = function(io) {
  return {router: router, models: ['Student']}
};
