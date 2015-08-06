var express = require('express');
var router = express.Router();
var moment = require('moment');
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
  req.Student.findOne({username: username}).populate('courses', 'mID title').exec(function(err, user) {
    if(err) throw err;

    if(!user){
      errs.push("0: Incorrect username or password.");
      done();
    }else{

      // ATTEMPT REGIS LOGIN

      var cookieJar = request.jar();
      request({
          url: 'https://intranet.regis.org/login/submit.cfm', //URL to hit
          jar: cookieJar,
          method: 'POST',
          //Lets post the following key/values as form
          form: {
              username: username,
              password: password
          }
      }, function(error, response, body){
        console.log("1: "+response.statusCode);
          if(error) {
              console.log("UGH");
              errs.push("1: Incorrect username or password.");
          }else{
            var $ = cheerio.load(body);
            var title = $("title").text();
            console.log(title);
            if( body.indexOf("<meta http-equiv=\"REFRESH\" content=\"0; url=http://www.regis.org/login.cfm?Failed=1\">") > -1){
              errs.push("2: Incorrect username or password.");
              done();
            }else{
              console.log("Logged in as "+user.username+" successfully.")
              request({
                  url: 'http://intranet.regis.org/functions/view_profile.cfm', //URL to hit
                  jar: cookieJar,
                  method: 'GET',
              }, function(error, response, html){
                if(error) {
                    console.log(error);
                    errs.push("1: Failed to register. Please try again later.");
                }else{
                  var $ = cheerio.load(html);

                  // SUCCESSFULLY LOGGED IN, IS THIS USER REGISTERED?


                  if(user.registered == false){
                    // NO, get his Student ID and register him!
                    var id = $("td:contains('Student ID #:')").next().text().trim();
                    console.log(id);
                    user.code = id;
                    user.loginCount = 0;
                    user.last_point_login_time = new Date();
                    user.registered_date = new Date();
                    user.registered = true;
                    new req.Log({who: user._id, what: "Registration."}).save();
                  }
                    // REGISTER THIS USER

                  user.login_count +=1;
                  user.last_login_time = new Date();
                  var fiveMinAgo = moment().subtract(5, 'minutes');
                  if(moment(user.last_point_login_time).isBefore(fiveMinAgo)){
                    user.points += 10;
                    req.session.info.push("You have been rewarded 10 points for logging in.");
                    user.last_point_login_time = new Date();
                  }
                  req.user = user;
                  req.session.currentUser = user;
                  user.save();

                  new req.Log({who: user._id, what: "Login."}).save();
                  req.session.quietlogin = false;
                }
                done();
              });
            }
          }
      });
    }
    function done(){
      req.session.errs = errs;
      if(errs.length > 0)
        res.redirect("/login");
      else
        res.redirect(req.query.redir);
    }
  });
});

router.get('/logout', function(req, res) {
  if(req.session.quietlogin == false)
    new req.Log({who: req.currentUser._id, what: "Logout."}).save();
  delete req.session.currentUser;
  delete req.currentUser;
  req.session.info.push("You have successfully logged out.");
  res.redirect('/');
});

router.get('/loginas', function(req, res) {
  var username = req.query.user;
  console.log(req.currentUser.username);
  if(req.currentUser && req.currentUser.username == "fmatranga18"){
    delete req.session.currentUser;
    delete req.currentUser;
    req.Student.findOne({username: username}).populate('courses', 'mID title').exec(function(err, user) {
      if(err) throw err;
      if(user){
        req.session.quietlogin = true;
        req.user = user;
        req.session.currentUser = user;
        res.redirect("/");
      }else{
        req.session.info.push("No such registered user!");
        res.redirect('/');
      }
    })
  }else{
    req.session.info.push("Only admins can do that!");
    res.redirect('/');
  }
});

module.exports.models = ['Student'];
module.exports.router = router;
