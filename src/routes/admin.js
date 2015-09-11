var express = require('express');
var router = express.Router();

// Only allow administrators, and me of course
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
    if(err){req.session.errs.push('An error occured, please try again.'); res.redirect('/'); return;}
    if(logs){
      req.toJade.logs = logs;
    }
    req.Feedback.find({}).sort({feedbackType: -1}).exec(function(err, feedback) {
      if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
      if(feedback){
        req.toJade.feedback = feedback;
      }
      res.render('admin/index', req.toJade);
    });
  });
});

router.post('/clearcollection', function(req,res){
  var coll = req.body.collection;
  if(['Feedback', 'Log', 'HWItem', 'Grade', 'Day', 'Reminder'].indexOf(coll)>-1){
    req[coll].remove({}, function(err) {
      if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
      new req.Log({who: req.currentUser._id, what: "Cleared the "+coll+" collection as Admin."}).save();
      req.session.info.push("Successfully cleared "+coll);
      done();
    });
  }else{
    req.session.errs.push('Nice try.');
    done();
  }

  function done(){res.redirect("/admin");}
});


module.exports = function(io) {
  return {router: router, models: ['Feedback', 'Days', 'HWItem', 'Grade', 'Reminder']}
};
