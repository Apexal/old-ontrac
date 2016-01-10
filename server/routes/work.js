var express = require('express');
var router = express.Router();
var moment = require('moment');
var schedules = require('../modules/schedule');

/* ----------------------------- */
/*         GET REQUESTS          */
/* ----------------------------- */

router.get('/', function(req, res) {
  var nD = schedules.getNextDay(moment(), req.currentUser.scheduleObject);
  req.toJade.closestDay = nD;
  if(nD == moment().add(1, 'days').format("YYYY-MM-DD")){
    req.toJade.nDName = "Tomorrow";
  }else{
    req.toJade.nDName = moment(nD, "YYYY-MM-DD").format("dddd");
  }
  req.toJade.title = "Your "+req.currentUser.gradeName+" Work";
  req.GradedItem.find({itemType: {$ne: "test"}, username: req.currentUser.username, date: {$gte: req.today, $lt: moment(req.today).add(20, 'days').toDate()}})
    .populate('course', 'title mID')
    .sort({date: 1})
    .exec(function(err, items) {
      req.toJade.projects = items;
      res.render('work/index', req.toJade);
    });
});

router.get('/closest', function(req, res) {
  var nD = schedules.getNextDay(moment(), req.currentUser.scheduleObject);
  if(!nD){
    req.session.info.push("Cannot find the next class day!");
    res.redirect("/work");
    return;
  }else{
    res.redirect("/work/"+nD);
  }
});

router.get("/today", function(req, res) {
  res.redirect("/work/"+moment().format("YYYY-MM-DD"));
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
  req.GradedItem.find({username: req.currentUser.username, itemType: {$ne: "test"}, date: {"$gte": start.toDate(), "$lt": end.toDate()}})
    .populate('course', 'title')
    .lean()
    .exec(function(err, items){
      if(err){console.log(err);res.json({error: err});return;}

      var events = [];

      if(items.length){
        items.forEach(function(item) {
          var title = item.course.title;
          if(title.length > 10)
            title = title.slice(0, 11).trim()+"...";

          var itemType = item.itemType;
          itemType = itemType.charAt(0).toUpperCase() + itemType.slice(1);

          events.push({
            title: title + " "+itemType,
            start: moment(item.date).format("YYYY-MM-DD"),
            color: "orange",
            url: "/work/"+item._id.toString()
          });
        });
        res.json(events);
      }else{
        res.json(null);
      }
    });
});

router.get('/:date', function(req, res, next){
  var dateString = req.toJade.dateString = req.params.date;
  req.toJade.day = false;
  req.toJade.date = false;
  req.toJade.isToday = (dateString == req.today.format("YYYY-MM-DD"));

  if(moment(dateString, 'YYYY-MM-DD', true).isValid() == false){
    next();
  }else{
    // Good date
    var date = req.toJade.date = moment(dateString, 'YYYY-MM-DD', true);
    req.toJade.title = date.format("dddd, MMM Do YY");
    req.toJade.items = false;

    if(req.currentUser.scheduleObject.scheduleDays[dateString] == undefined){
      req.session.info.push("Redirected to closest school day.");
      // Passed date is not a school, day try to find the next one
      console.log("Not school day, finding closest one.");
      var nD = schedules.getNextDay(date, req.currentUser.scheduleObject);
      if(!nD){
        req.session.info.push("Cannot find the next class day!");
        res.redirect("/work");
        return;
      }else{
        res.redirect('/work/'+nD);
        return;
      }

      var pD = schedules.getPrevDay(date, req.currentUser.scheduleObject);
      if(!pD){
        req.session.info.push("Cannot find the previous class day!");
        res.redirect("/work");
        return;
      }else{
        res.redirect('/work/'+pD);
        return;
      }
    }
    req.toJade.scheduleDay = req.currentUser.scheduleObject.scheduleDays[dateString];

    // Get time from today to this date
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

    // GET THE NEXT AND PREVIOUS DATES FOR THE DAY CONTROLS
    req.toJade.nextDay = schedules.getNextDay(date, req.currentUser.scheduleObject);
    req.toJade.previousDay = schedules.getPrevDay(date, req.currentUser.scheduleObject);

    var classes = req.currentUser.scheduleObject.dayClasses[req.toJade.scheduleDay];
    req.toJade.classes = classes;
    res.render('work/one', req.toJade);
  }
});

router.get("/:pid", function(req, res) {
  var id = req.params.pid;
  req.GradedItem.findOne({_id: id})
    .populate('course', 'title mID')
    .exec(function(err, project) {
      if(err){req.session.errs.push("Failed to get project!"); res.redirect('/work'); return;}
      if(project){
        req.toJade.project = project;
        res.render('work/project', req.toJade);
      }else{
        req.session.errs.push("No such project exists!"); res.redirect('/work'); return;
      }
    });
});

router.post("/add", function(req, res) {
  console.log(req.body);
  var pCourse = req.body.projectCourse;
  var pPriority = req.body.projectPriority;
  var pTitle = req.body.projectTitle;
  var pDueDate = req.body.projectDueDate;

  if(!pCourse || !pPriority || !pTitle || !pDueDate){
    req.session.errs.push("Not enough parameters!");
    res.redirect('/work');
    return;
  }

  if(req.currentUser.scheduleObject.scheduleDays[pDueDate] == undefined){
    req.session.errs.push("Not a school day!"); res.redirect(req.baseUrl); return;
  }

  var project = new req.GradedItem({
    username: req.currentUser.username,
    itemType: "project",
    date: pDueDate,
    course: pCourse,
    priority: pPriority,
    title: pTitle
  });

  project.save(function(err) {
    if(err){req.session.errs.push("Failed to save project."); res.redirect(req.baseUrl); return;}
    new req.Log({who: req.currentUser.username, what: "Added a project due "+pDueDate, when: new Date()});
    req.Student.findOneAndUpdate({username: req.currentUser.username}, {"$inc": {points: 50}}, function(err) {
      if(err){req.session.errs.push("Failed to add points."); res.redirect(req.baseUrl); return;}
      res.redirect("/work/"+project._id);
    });
  });
});



module.exports = function(io) {
  return {router: router, models: ['HWItem', 'Course', 'GradedItem']}
};
