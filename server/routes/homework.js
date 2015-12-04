var express = require('express');
var router = express.Router();
var moment = require('moment');
var schedules = require('../modules/schedule');

// GET ALL THE ITEMS ON A DATE
router.get("/:date", function(req, res) {
  var dateString = req.params.date;
  var day = false;

  if(moment(dateString, 'YYYY-MM-DD', true).isValid() == false){
    res.json({error: "Bad date."}); // Bad date passed
    return;
  }
  var date = req.toJade.date = moment(dateString, 'YYYY-MM-DD', true); // Good date
  if(req.currentUser.scheduleObject.scheduleDays[date.format("MM/DD/YY")] == undefined){
    res.json({error: "Date passed is not a school day."});
    return;
  }
  req.HWItem.find({username: req.currentUser.username, date: date.toDate()})
    .populate('course', 'title mID')
    .lean()
    .exec(function(err, hwItems){
      if(err){res.json({error: err}); return;}
      if(hwItems){
        res.json(hwItems);
      }else{
        res.json({error: "No items found"});
      }
    });
});


// TOGGLE THE COMPLETION ON A HOMEWORK ITEM
router.post("/:date", function(req, res){
  var dateString = req.params.date;
  var day = false;
  var hwItemID = req.body.setCompHWItemID;
  if(moment(dateString, 'YYYY-MM-DD', true).isValid() == false){
    res.json({error: "Bad date."}); // Bad date passed
    return;
  }
  var date = req.toJade.date = moment(dateString, 'YYYY-MM-DD', true); // Good date
  if(req.currentUser.scheduleObject.scheduleDays[date.format("MM/DD/YY")] == undefined){
    res.json({error: "Date passed is not a school day."});
    return;
  }
  req.HWItem.findOne({_id: hwItemID}, function(err, hwitem){
    if(err){res.json({error: "An error occured. Please try again later."}); return;}
    if(hwitem){
      var itemStatus = req.body.setCompHWItemStatus;
      hwitem.completed = itemStatus;
      hwitem.save(function(err) {
        if(err){res.json({error: "An error occured. Please try again later."}); return;}
        new req.Log({who: req.currentUser.username, what: "Toggled a HWItem's completion for "+dateString}).save();
        res.json({success: true});
      });
    }else{
      res.json({error: "No item found."});
    }
  });
});


// ADD HOMEWORK ITEM
router.put("/:date", function(req, res){
  var dateString = req.params.date;
  var day = false;

  if(moment(dateString, 'YYYY-MM-DD', true).isValid() == false){
    res.json({error: "Bad date."}); // Bad date passed
    return;
  }
  var date = moment(dateString, 'YYYY-MM-DD', true); // Good date
  if(req.currentUser.scheduleObject.scheduleDays[date.format("MM/DD/YY")] == undefined){
    res.json({error: "Date passed is not a school day."});
    return;
  }
  // Construct new HWItem
  //console.log(req.body);
  var courseID = req.body.newHWItemCourseID;
  var desc = req.body.newHWItemDesc;
  var link = req.body.newHWItemLink;
  var newHWItem = new req.HWItem({
    date: date.toDate(),
    username: req.currentUser.username,
    course: courseID,
    desc: desc,
    link: link,
    completed: false
  });
  //console.log(newHWItem);
  newHWItem.save(function(err){
    if(err){res.json({error: "Failed to save new item. Please try again later."}); return;}
    new req.Log({who: req.currentUser.username, what: "Added a HWItem to "+dateString}).save();
    req.Course.findOne({_id: newHWItem.course}, 'mID title', function(err, c) {
      newHWItem.course = c;
      res.json({success: true, added: newHWItem.toJSON()});
    });
  });
});


// REMOVE HOMEWORK ITEM
router.delete("/:date", function(req, res){
  var dateString = req.params.date;
  var day = false;
  var id = req.body.deleteHWItemID;

  if(moment(dateString, 'YYYY-MM-DD', true).isValid() == false){
    res.json({error: "Bad date."}); // Bad date passed
    return;
  }
  var date = req.toJade.date = moment(dateString, 'YYYY-MM-DD', true); // Good date
  if(req.currentUser.scheduleObject.scheduleDays[date.format("MM/DD/YY")] == undefined){
    res.json({error: "Date passed is not a school day."});
    return;
  }
  req.HWItem.remove({_id: id}, function(err){
    if(err){res.json({error: "Failed to remove item. Please try again later."}); return;}
    new req.Log({who: req.currentUser.username, what: "Removed a HWItem for "+dateString}).save();
    res.json({success: true});
  });
});



// CALENDAR EVENTS

// GET ALL THE ITEMS ON A DATE
router.get("/:date/event", function(req, res) {
  var dateString = req.params.date;
  var day = false;

  if(moment(dateString, 'YYYY-MM-DD', true).isValid() == false){
    res.json(null); // Bad date passed
    return;
  }
  var date = req.toJade.date = moment(dateString, 'YYYY-MM-DD', true); // Good date
  if(req.currentUser.scheduleObject.scheduleDays[date.format("MM/DD/YY")] == undefined){
    res.json(null);
    return;
  }
  req.HWItem.find({username: req.currentUser.username, date: date.toDate()})
    .populate('course', 'title')
    .lean()
    .exec(function(err, items){
      if(err){res.json(null); console.log(err); return;}
      if(items.length > 0){

        var hwTitles = [];
        var counts = {};
        var doneC = 0;
        var total = items.length;
        items.forEach(function(item){
          if(item.completed)
            doneC++;
          //console.log(item.course.title);
          if(hwTitles.indexOf(item.course.title) == -1)
            hwTitles.push(item.course.title);

          if(!counts[item.course.title])
            counts[item.course.title] = 0;
          counts[item.course.title] += 1;
        });

        var desc = [];
        hwTitles.forEach(function(title) {
          desc.push("<b>"+counts[title]+"</b> items for <i>"+title+"</i>");
        });

        var percent = Math.round((doneC/total)*100);
        var color = 'green';
        if(total > 3) color = 'yellow';
        if(total > 6) color = 'red';

        var percentage = "";
        if(percent !== 100)
          percentage = " <small class='right'>"+percent+"% Done</small>";

        res.json({
          title: total+" Items"+percentage,
          start: dateString,
          color: color,
          textColor: (color == 'yellow' ? 'black' : 'white'),
          description: desc.join(', ')
        });
      }else{
        res.json(null);
      }
    });
});


module.exports = function(io) {
  return {router: router, models: ['HWItem', 'Course']}
};
