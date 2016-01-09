var express = require('express');
var router = express.Router();
var moment = require("moment");

router.get('/', function(req, res) {
  req.toJade.title = "Daily Thoughts";
  var min = moment().subtract(7, 'days').toDate();
  req.DailyThought.find({username: req.currentUser.username, date: {'$gte': min, '$lte': new Date()}})
    .exec(function(err, thoughts) {
      if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
      if(thoughts){
        req.toJade.thoughts = thoughts;
      }
      res.render('thoughts/index', req.toJade);
    });
});

router.post('/add', function(req, res) {
  var body = req.body.newThoughtsBody;
  var date = moment().startOf('day').toDate();
  if(!body){
    req.session.errs.push('Invalid parameters.'); res.redirect(req.baseUrl); return;
  }
  req.DailyThought.findOne({username: req.currentUser.username, date: date}, function(err, thought) {
    if(err){req.session.errs.push('Failed to save item.'); res.redirect(req.baseUrl); return;}
    if(!thought){
      thought = new req.DailyThought({
        username: req.currentUser.username,
        date: date,
        body: body
      });
      req.session.currentUser.points += 20;
      req.Student.findOneAndUpdate({username: req.currentUser.username}, {"$inc": {points: 20}}, function(err) {
        if(err){req.session.errs.push('Failed to give reward.'); res.redirect(req.baseUrl); return;}
      });
      req.session.info.push("You've been rewarded 20 points for recording a Daily Thought!");
    }else{
      thought.body = body;
    }
    thought.save(function(err) {
      if(err){req.session.errs.push('Failed to save item.'); res.redirect(req.baseUrl); return;}
      req.session.dailythought = thought.body;
      new req.Log({who: req.currentUser.username, what: "Updated DailyThought for "+moment(date).format("YYYY-MM-DD")}).save();
      res.redirect("/thoughts");
    });
  });

});

module.exports = function(io) {
  return {router: router, models: ['DailyThought', 'Student']}
};
