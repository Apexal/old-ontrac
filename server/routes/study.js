var express = require('express');
var router = express.Router();
var moment = require('moment');

router.get('/', function(req, res) {
  req.toJade.title = "Study Management";
  req.GradedItem.find({username: req.currentUser.username, itemType: "test", date: {"$gte": moment().startOf('day').toDate()}})
    .populate('course', 'title mID')
    .sort({date: 1})
    .exec(function(err, items) {
      if(err){req.session.errs.push("Failed get all items.");res.redirect(req.baseUrl);return;}
      req.toJade.today = [];
      req.toJade.upcoming = [];
      items.forEach(function(i) {
        if(moment(i.date).isSame(req.today))
          req.toJade.today.push(i);
        else
          req.toJade.upcoming.push(i);
      });
      res.render('study/index', req.toJade);
    });

});

router.get("/events", function(req, res) {
  var startDateString = req.query.start;
  var endDateString = req.query.end;
  if(!startDateString || !endDateString || !moment(startDateString, 'YYYY-MM-DD',
    true).isValid() || !moment(endDateString, 'YYYY-MM-DD', true).isValid()){
      res.json({error: "Invalid paramaters."});
      return;
    }

  var start = moment(startDateString, 'YYYY-MM-DD', true);
  var end = moment(endDateString, 'YYYY-MM-DD', true);
  req.GradedItem.find({username: req.currentUser.username, itemType: "test", date: {"$gte": start.toDate(), "$lt": end.toDate()}})
    .populate('course', 'title')
    .lean()
    .exec(function(err, items){
      if(err){console.log(err);res.json({error: err});return;}

      var events = [];

      if(items.length){
        items.forEach(function(item) {
          events.push({
            title: item.course.title + " Test",
            start: moment(item.date).format("YYYY-MM-DD"),
            color: "red",
            url: "/study/"+item._id.toString()
          });
        });
        res.json(events);
      }else{
        res.json(null);
      }
    });
});

router.get('/:id', function(req, res) {
  var id = req.params.id;

  req.GradedItem.findOne({itemType: "test", username: req.currentUser.username, _id: id})
    .lean()
    .populate('course', 'mID title')
    .exec(function(err, item) {
      if(err){req.session.errs.push("Failed get item.");res.redirect(req.baseUrl);return;}

      if(item){
        req.toJade.item = item;
        res.render('study/one', req.toJade);
      }else{
        req.session.errs.push("No such item exists!");res.redirect(req.baseUrl);return;
      }
    });
});

module.exports = function(io) {
  return {router: router, models: ['GradedItem', 'Course']}
};
