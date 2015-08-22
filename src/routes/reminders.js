var express = require('express');
var router = express.Router();

router.get("/all", function(req, res) {
  req.Reminder.find({username: req.currentUser.username}, function(err, reminders) {
    if(err) throw err;
    if(reminders){
      res.json({reminders: reminders});
    }
  });
});

router.post("/add", function(req, res) {
  var desc = req.body.desc;

  if(desc){
    var reminder = new req.Reminder({
      username: req.currentUser.username,
      desc: desc
    }).save(function(err) {
      if(err) throw err;
      res.json({success: true});
      console.log("ALL GOOD!");
      new req.Log({who: req.currentUser._id, what: "New reminder."}).save();
    });
  }else{
    console.log("No desc!");
  }
});

router.post("/remove", function(req, res) {
  var id = req.body.id;
  if(id){
    req.Reminder.remove({_id: id}, function(err) {
      if(err) throw err;
      res.json({success: true});
      new req.Log({who: req.currentUser._id, what: "Deleted reminder."}).save();
    });
  }
});

module.exports = function(io) {
  return {router: router, models: ['Reminder']}
};
