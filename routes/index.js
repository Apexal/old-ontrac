var express = require('express');
var router = express.Router();
var adv = require('../modules/advisements');
var moment = require('moment');
redir = "/";

/* GET home page. */
router.get('/', function(req, res, next) {
  req.toJade.title = "Adiutor";
  res.render('index', req.toJade);
});

router.get('/login', function(req, res, next) {
  req.toJade.title = "Login";
  req.toJade.redir = (req.query.redir ? req.query.redir : "/")
  res.render('users/login', req.toJade);
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  var fiveMinAgo = moment().subtract(5, 'minutes');
  if(moment(req.user.last_point_login_time).isBefore(fiveMinAgo)){
      req.User.findOne({username: req.user.username}, function(err, user) {
        user.points += 10;
        req.session.info.push("You got 10 points for logging in!");
        user.last_point_login_time = new Date();
        user.save();
        console.log("10 points given to "+user.username+" for logging in");
        res.redirect(req.query.redir);
      });
  }else{
    res.redirect(req.query.redir);
  }
});

router.get('/register', function(req, res) {
  req.toJade.title = "Register";
  req.toJade.adv = adv;
  res.render('users/register', req.toJade);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/forgot', function(req, res) {

});

module.exports = router;
