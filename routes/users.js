var express = require('express');
var router = express.Router();
var bCrypt = require('bcrypt-nodejs');
var adv = require('../modules/advisements');

/* GET users listing. */
router.get('/', function(req, res, next) {
  req.toJade.title = "Users";
  req.User.find({}, function(err, users){
    if(err) console.log(err);
    req.toJade.users = users;
    res.render('users/list', req.toJade);
  });
});


router.post('/login', passport.authenticate('local', { successRedirect: '/',
                                                    failureRedirect: '/login' }));

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


router.get("/:username", function(req, res){
  if(req.toJade.loggedIn == false){
    res.redirect("/users");
    return;
  }
  req.User.findOne({username: req.params.username}, function(err, user) {
    if(user){
      req.toJade.title = user.firstName+" "+user.lastName.charAt(0)+" of "+user.advisement;
      req.toJade.user = user;
      res.render('users/profile', req.toJade);
    }else{
      res.redirect("/users");
    }
  });
});

router.get("/:username/schedule", function(req, res){
  if(req.toJade.loggedIn == false){
    res.redirect("/users");
    return;
  }

  req.User.findOne({username: req.params.username}, function(err, user) {
    if(user){
      req.toJade.title = user.firstName+" "+user.lastName.charAt(0)+"'s Schedule";
      req.toJade.user = user;
      res.render('users/schedule', req.toJade);
    }else{
      res.redirect("/users");
    }
  });
});

module.exports = router;
