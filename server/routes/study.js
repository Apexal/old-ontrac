var express = require('express');
var router = express.Router();
var moment = require('moment');

router.get('/', function(req, res) {
  req.toJade.title = "Study Management";
  req.GradedItem.find({username: req.currentUser.username, dateTaken: {"$gte": moment().startOf('day').toDate()}})
    .populate('course', 'title mID')
    .sort({dateTaken: 1})
    .exec(function(err, items) {
      if(err){req.session.errs.push("Failed get all items.");res.redirect(req.baseUrl);return;}
      req.toJade.today = [];
      req.toJade.upcoming = [];
      items.forEach(function(i) {
        if(moment(i.dateTaken).isSame(req.today))
          req.toJade.today.push(i);
        else
          req.toJade.upcoming.push(i);
      });
      res.render('study/index', req.toJade);
    });

});

module.exports = function(io) {
  return {router: router, models: ['HWItem', 'Course']}
};
