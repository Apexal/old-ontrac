var express = require('express');
var router = express.Router();


router.get('/*', function(req, res, next) {
  if(req.currentUser.rank > 4 || req.currentUser.username == "fmatranga18"){
    next();
  }else{
    req.session.errs.push("You are not an admin!");
    res.redirect("/");
  }
});

router.get('/', function(req, res) {
  req.toJade.title = "Admin Home";
  req.toJade.logs = false;
  req.toJade.feedback = false;

  req.Log.find({}).populate('who', 'username firstName lastName').sort({when : -1}).exec(function(err, logs) {
    if(err) throw err;

    if(logs){
      req.toJade.logs = logs;
    }

    req.Feedback.find({}).sort({feedbackType: -1}).exec(function(err, feedback) {
      if(err) throw err;

      if(feedback){
        req.toJade.feedback = feedback;
      }

      res.render('admin/index', req.toJade);
    });
  });
});

router.get('/logs', function(req, res) {
  req.toJade.title = "Logs";

});

module.exports = function(io) {
  return {router: router, models: ['Feedback']}
};
