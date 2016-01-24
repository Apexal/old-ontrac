var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  req.toJade.title = "Your Contributions";
  req.Feedback.find({username: req.currentUser.username})
    .sort({date: -1})
    .exec(function(err, feedback) {
      if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
      req.toJade.accepted = feedback.filter(function(f) {
        return f.accepted;
      });
      req.toJade.pending = feedback.filter(function(f) {
        return !f.accepted;
      });
      req.toJade.recent = feedback.splice(0, 5);
      res.render('contributions/index', req.toJade);
    });
});

router.post('/submit', function(req, res) {
  var cType = req.body.cType;
  var cBody = req.body.cBody;

  if(!cType || !cBody || ['issue', 'suggestion'].indexOf(cType.toLowerCase()) == -1){
    req.session.errs.push('Invalid query.'); res.redirect(req.baseUrl); return;
  }

  var newFeedback = req.Feedback({
    username: req.currentUser.username,
    feedbackType: cType,
    text: cBody,
    date_sent: new Date()
  });

  newFeedback.save(function(err) {
    if(err){req.session.errs.push('Failed to save feedback.'); res.redirect(req.baseUrl); return;}
    req.session.info.push("Successfully submitted Feedback!");
    res.redirect("/contributions");
  });
});

module.exports = function(io) {
  return {router: router, models: ['Feedback']}
};
