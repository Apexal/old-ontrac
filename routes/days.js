var express = require('express');
var router = express.Router();
var moment = require('moment');
var _ = require('underscore');

router.get(['/', '/closest'], function(req, res) {
  req.Day.getClosest(req.currentUser.username, req.today, function(err, day) {
    if(err) throw err;

    if(day){
      console.log("FOUND DAY");
    }else{
      res.redirect("/days/today");
    }
  });
});

router.get("/today", function(req, res) {
  res.redirect("/days/"+moment().format("YYYY-MM-DD"));
});

router.get("/:date", function(req, res) {
  var dateString = req.params.date;
  req.toJade.dateString = dateString;
  req.toJade.day = false;
  req.toJade.date = false;

  if(moment(dateString, 'YYYY-MM-DD', true).isValid() == false){
    req.toJade.title = "Invalid Date";
    res.render('homework/day', req.toJade);
  }else{
    var date = moment(dateString, 'YYYY-MM-DD', true);
    req.toJade.date = date;
    req.toJade.title = date.format("dddd, MMM Do YY");
    req.toJade.work = false;

    var diff = moment(date).diff(req.today, 'days');
    if(diff == 0)
      req.toJade.fromNow = "today";
    else if(diff == 1)
      req.toJade.fromNow = "tomorrow";
    else if(diff > 0)
      req.toJade.fromNow = diff+" days away";
    else if(diff == -1)
      req.toJade.fromNow = "yesterday";
    else
      req.toJade.fromNow = Math.abs(diff)+" days ago";

    req.toJade.next = date.add(1, 'days').format('YYYY-MM-DD');
    // We subtract 2 since we just added one above
    req.toJade.previous = date.subtract(2, 'days').format('YYYY-MM-DD');

    req.Day.findOne({username: req.currentUser.username, date: date.toDate()}, function(err, day) {
      if(err) throw err;

      if(day){
        req.toJade.day = day;
      }
      res.render('days/one', req.toJade);
    });
  }
});

module.exports.models = ['Day'];
module.exports.router = router;
