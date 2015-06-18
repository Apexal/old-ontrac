var express = require('express');
var router = express.Router();
var adv = require('../modules/advisements');
var moment = require('moment');
var bCrypt = require('bcrypt-nodejs');
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




router.post('/register', function(req, res) {
  var email = req.body.email;
  var name = req.body.name;
  var password =  createHash(req.body.password);
  var advisement = req.body.advisement;
  var code = req.body.code;
  var errs = [];

  if(email.indexOf("@regis.org", email.length - "@regis.org".length) == -1)
    errs.push("Must use a Regis email.");

  if(name.split(" ").length != 2)
      errs.push("Your full name must be used.");

  if(isNaN(code))
    errs.push("Thats not a Student ID#");

  req.User.findOne({email: email}, function(err, user) {
    if(user){
      errs.push("User already exists!");
    }
    finish();
  });

  function finish() {
    if(errs.length == 0){
      var newUser = new req.User({
        firstName: name.split(" ")[0],
        lastName: name.split(" ")[1],
        username: email.replace("@regis.org", ""),
        code: code,
        email: email,
        advisement: advisement,
        classes: [],
        password: password,
        rank: 0,
        points: 10,
        loginCount: 0,
        last_login_time: new Date(),
        last_point_login_time: new Date(),
        preferences: {},
        verified: false,
        registered_date: new Date()
      });

      newUser.save();
      req.toJade.title="Adiutor";
      req.toJade.info = ["You have successfully registered! Check your email to verify your account."];

      res.render('index', req.toJade);
    }else{
      req.toJade.title = "Register";
      req.toJade.errs = errs;
      req.toJade.adv = adv;
      res.render('users/register', req.toJade);
    }
  }
});

var createHash = function(password){
 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/forgot', function(req, res) {

});

module.exports = router;
