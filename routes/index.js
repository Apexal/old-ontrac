var express = require('express');
var router = express.Router();
var moment = require('moment');
var bCrypt = require('bcrypt-nodejs');
var request = require("request");
var cheerio = require("cheerio");

var redir = "/";

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

router.post('/login', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  var errs = [];
  req.Student.findOne({registered: true, username: username}, function(err, user) {
    if(err) throw err;

    if(!user){
      errs.push("Incorrect username or password.")
    }else{
      if(!isValidPassword(user, password)){
        errs.push("Incorrect username or password.")
      }else{

        req.user = user;
        req.session.currentUser = user;
        console.log(req.session.currentUser.fullName);
        user.login_count +=1;
        user.last_login_time = new Date();
        var fiveMinAgo = moment().subtract(5, 'minutes');
        if(moment(user.last_point_login_time).isBefore(fiveMinAgo)){
          user.points += 10;
          req.session.info.push("You have been rewarded 10 points for logging in.");
          user.last_point_login_time = new Date();
        }
        user.save();
      }
    }
    req.session.errs = errs;
    if(errs.length == 0)
      res.redirect(req.query.redir);
    else
      res.redirect("/login");
  });
});

router.get('/register', function(req, res) {
  req.toJade.title = "Register";
  res.render('users/register', req.toJade);
});




router.post('/register', function(req, res) {
  var password =  createHash(req.body.password);
  var code = req.body.code;
  var errs = [];

  var advisement = "";
  var username = "";

  if(isNaN(code))
    errs.push("Thats not a Student ID#");


  var cookieJar = request.jar();
  request({
      url: 'https://intranet.regis.org/login/submit.cfm', //URL to hit
      jar: cookieJar,
      method: 'POST',
      //Lets post the following key/values as form
      form: {
          username: 'fmatranga18',
          password: '1hope1havenotusedthisbefore!'
      }
  }, function(error, response, body){
      if(error) {
          console.log("UGH");
          errs.push("1: Failed to register. Please try again later.");
      }else{
        var $ = cheerio.load(body);
        if($(".alert-danger").length > 0){

          errs.push("0: Failed to register. Please try again later.");
        }else{
          request({
              url: 'http://intranet.regis.org/infocenter/default.cfm?StudentCode='+code, //URL to hit
              jar: cookieJar,
              method: 'GET',
              //Lets post the following key/values as form
          }, function(error, response, html){
            if(error) {
                console.log(error);
                errs.push("1: Failed to register. Please try again later.");
            }else{
              var $ = cheerio.load(html);
              info = $("#main table[width='650'][cellpadding='0'] tr:nth-child(2)").text().trim().replace(/\s\s+/g, ' ');

              var parts = info.split(" ");
              var advisement = parts[2];
              var firstName = parts[0].toLowerCase();
              lastName = parts[1].toLowerCase();

              if(isNaN(advisement.charAt(0))){
                errs.push("2: Failed to register. Please try again later.")
              }else{
                username = firstName.charAt(0)+lastName+(19 - parseInt(advisement.charAt(0)));
              }
            }
            continues();
          });
        }

      }
  });

  function continues() {
    req.Student.findOne({username: username}, function(err, user) {
      if(err) throw err;

      if(user){
        if(user.registered == true){
          errs.push("User already exists!");
        }
      }else{
        errs.push("Please use a valid code.");
      }
      if(errs.length == 0){
        user.code = code;
        user.password = password;
        user.loginCount = 0;
        user.last_login_time = new Date();
        user.last_point_login_time = new Date();
        user.registered_date = new Date();
        user.registered = true;

        user.save();
        req.toJade.title="Adiutor";
        req.toJade.info = ["Thank you for registering, "+user.firstName+"! Check your email to verify your account."];

        var message = "<p>Thank you for registering for <b>Worker</b>! <br> \
                      Before you can start using it, please verify your account by  \
                      clicking <a href='http://regismumble.ddns.net:3000/verify?id="+user._id.toString()+"'>here</a>.</p>"

        try{
          require("../modules/mailer.js")(user.email, "Welcome to Worker!", message);
        }catch (err) {
          console.log(err);
        }
        res.render('index', req.toJade);
      }else{
        req.toJade.title = "Register";
        req.toJade.errs = errs;
        res.render('users/register', req.toJade);
      }

    });
  }
});

router.get('/verify', function(req, res) {
  var id = req.query.id;
  req.Student.findOne({registered: true, verified: false, _id: id}, function(err, user) {
    if(err) throw err;

    if(user){
      req.session.info.push("You have successfully verified your account.");
      user.verified = true;
      user.save();

      var message = "<p>Congratulations, "+user.firstName+". You are now ready to \
      use <b>Worker</b>!</p><br><p>Once you login, edit your profile to select \
      your classes.";

      try{
        require("../modules/mailer.js")(user.email, "All Ready", message);
      }catch (err) {
        console.log(err);
      }
    }else{
      console.log("Failed to verify user.");
    }
    res.redirect("/");
  });
});

router.get('/logout', function(req, res) {
  delete req.session.currentUser;
  req.session.info.push("You have successfully logged out.");
  res.redirect('/');
});

router.get('/forgot', function(req, res) {

});

var createHash = function(password){
 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}

module.exports = router;
