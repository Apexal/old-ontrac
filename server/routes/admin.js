var express = require('express');
var router = express.Router();
var achievements = require("../modules/achievements");

// Only allow administrators, and me of course
router.all('/*', function(req, res, next) {
  if(req.currentUser.username == "fmatranga18"){
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

  req.Log.find({who: {$ne: "fmatranga18"}})
    .sort({when : -1})
    .exec(function(err, logs) {
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
  var query = {};
  if(req.body.username)
    query.username = req.body.username;

  if(['Feedback', 'Log', 'HWItem', 'Grade', 'Reminder'].indexOf(coll)>-1){
    req[coll].remove(query, function(err) {
      if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
      new req.Log({who: req.currentUser.username, what: "Cleared the "+coll+" collection as Admin."}).save();
      req.session.info.push("Successfully cleared "+coll);
      done();
    });
  }else{
    req.session.errs.push('Nice try.');
    done();
  }
  function done(){res.redirect("/admin");}
});

router.post('/bounty', function(req, res) {
  var username = req.body.username;
  var reward = req.body.reward;
  var desc = req.body.description;

  var ach = achievements[17];

  if(!username || !reward || !desc || isNaN(reward)){
    req.session.errs.push('Not enough parameters.'); res.redirect(req.baseUrl); return;
  }

  req.Student.findOne({username: username, registered: true}, function(err, user) {
    if(!user || err){req.session.errs.push('Failed to get student.'); res.redirect(req.baseUrl); return;}


    if(user.achievements.indexOf(ach.id) == -1){ user.achievements.push(ach.id); user.points+=ach.reward; }else{user.points += parseInt(reward);}
    user.save(function(err) {
      if(err){req.session.errs.push('Failed to save student.'); res.redirect(req.baseUrl); return;}
      req.session.info.push("Successfully rewarded and alerted "+username);

      var emailHTML = "<h1>Fantastic Work, "+user.firstName+"!</h1><p>You have been rewarded a bounty of "+reward+" points on <b>OnTrac</b> for <br>";
      emailHTML += "<i>"+desc+"</i><p><h3>Keep up the good work!</h3>";

      require("../modules/mailer")(user.email, "You've been Rewarded!", emailHTML);
      res.redirect("/admin");
    });
  });
});

router.post('/:id', function(req, res) {
  var id = req.params.id;
  var action = req.body.action;

  req.Student.findOne({_id: id}, function(err, user) {
    if(err){req.session.errs.push('Failed to get account.'); res.redirect(req.baseUrl); return;}
    console.log("ADMIN ACTION: "+action+" - "+user.username);
    if(action == "lock"){
      user.locked = true;
    }else if(action == "unlock"){
      user.locked = false;
    }else if(action == "deactivate"){
      user.registered = false;
    }else if(action == "reset"){
      user.bio = "";
      user.steamlink = "";
      user.achievements = [];
      user.points = 0;
      user.rank = 1;
      user.login_count = 0;
      user.registered = false;
      user.customLinks = {};
    }
    user.save(function(err) {
      if(err){req.session.errs.push('Failed to save account.'); res.redirect(req.baseUrl); return;}
      req.session.info.push("Successfully completed account "+action+" for "+user.username);
      res.redirect("/users/"+user.username);
    });
  });
});

module.exports = function(io) {
  return {router: router, models: ['Feedback', 'Day', 'HWItem', 'Grade', 'Reminder', 'Student']}
};
