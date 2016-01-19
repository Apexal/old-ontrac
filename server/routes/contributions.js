var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  req.toJade.title = "Your Contributions";
  req.Feedback.find({username: req.currentUser.username})
    .sort({date: -1})
    .exec(function(err, feedback) {
      req.toJade.accepted = feedback.filter(function(f) {
        return f.accepted;
      });
      req.toJade.pending = feedback.filter(function(f) {
        return f.false;
      });
      req.toJade.recent = feedback.splice(0, 5);
      res.render('contributions/index', req.toJade);
    });
});

module.exports = function(io) {
  return {router: router, models: ['Feedback']}
};
