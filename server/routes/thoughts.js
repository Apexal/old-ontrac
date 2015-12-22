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
        req.toJade.recent = thoughts;
      }
      res.render('thoughts/index', req.toJade);
    });
});

module.exports = function(io) {
  return {router: router, models: ['DailyThought']}
};
