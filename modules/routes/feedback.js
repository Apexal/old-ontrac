var express = require('express');
var router = express.Router();

router.get("/", function(req, res) {
  if(req.currentUser.username == "fmatranga18"){
    req.toJade.feedback = false;
    req.toJade.title = "User Feedback";

    req.Feedback.find({}, function(err, feedback) {
      if(err) throw err;
      if(feedback){
        req.toJade.feedback = feedback;
        console.log(feedback);
      }
      res.render("admin/feedback", req.toJade);
    });
  }else{
    req.session.errs.push("You aren't Frank!");
    res.redirect("/");
  }
});

router.post("/send", function(req, res) {
  var feedbackType = req.body.feedbackType;
  var text = req.body.text;
  if(text && feedbackType){
    console.log(feedbackType + " " + text);
    new req.Feedback({
      feedbackType: feedbackType,
      text: text
    }).save(function(err, fb) {
      if(err) throw err;
      res.json({success: true});
      console.log(fb);
    });
  }else{
    res.end("Not enough info.");
  }
});

module.exports = function(io) {
  return {router: router, models: ['Feedback']}
};
