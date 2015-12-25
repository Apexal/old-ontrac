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

router.post('/', function(req, res) {
  var body = req.body.newThoughtsBody;
  var date = moment().startOf('day').toDate();
  if(!body){
    req.session.errs.push('Invalid parameters.'); res.redirect(req.baseUrl); return;
  }
  if(req.currentUser.scheduleObject.scheduleDays[moment().format("YYYY-MM-DD")] == undefined){
    req.session.errs.push('Not a school day.'); res.redirect(req.baseUrl); return;
  }
  req.DailyThought.findOne({username: req.currentUser.username, date: date}, function(err, thought) {
    if(err){req.session.errs.push('Failed to save item.'); res.redirect(req.baseUrl); return;}
    console.log(thought);
    if(!thought){
      thought = new req.DailyThought({
        username: req.currentUser.username,
        date: date,
        body: body
      });
    }else{
      thought.body = body;
    }
    thought.save(function(err) {
      if(err){req.session.errs.push('Failed to save item.'); res.redirect(req.baseUrl); return;}
      req.session.dailythought = thought.body;
      res.redirect("/thoughts");
    });
  });

});

module.exports = function(io) {
  return {router: router, models: ['DailyThought']}
};
