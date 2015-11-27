var express = require('express');
var router = express.Router();

router.get("/all", function(req, res) {
  req.Reminder.find({username: req.currentUser.username}, function(err, reminders) {
    if(err){res.json({error: err}); return;}
    if(reminders){
      res.json(reminders);
    }
  });
});

router.post("/add", function(req, res) {
  var desc = req.body.desc;

  if(desc){
    var reminder = new req.Reminder({
      username: req.currentUser.username,
      desc: desc
    });
    reminder.save(function(err) {
      if(err){res.json({error: err}); return;}
      res.json({success: true, added: reminder.toObject()});
      new req.Log({who: req.currentUser.username, what: "New reminder."}).save();
    });
  }else{
    res.json({error: "Please give a description!"});
  }
});

router.post("/remove", function(req, res) {
  var id = req.body.id;
  if(id){
    req.Reminder.remove({_id: id}, function(err) {
      if(err){res.json({error: err}); return;}
      res.json({success: true, removedID: id});
      new req.Log({who: req.currentUser.username, what: "Deleted reminder."}).save();
    });
  }
});

module.exports = function(io) {
  return {router: router, models: ['Reminder']}
};
