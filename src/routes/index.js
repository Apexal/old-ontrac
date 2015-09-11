var express = require('express');
var router = express.Router();
var moment = require('moment');
var request = require("request");
var cheerio = require("cheerio");
var achievements = require("../modules/achievements");

var redir = "/";

module.exports = function(io) {
  /* GET home page. */
  router.get(['/', '/home'], function(req, res, next) {
    req.toJade.title = "OnTrac";
    if(req.loggedIn){
      req.toJade.title = "Your Home";
      console.log(req.currentUser.nickname);
      res.render('home/homepage', req.toJade);
    }else{
      res.render('home/index', req.toJade);
    }
  });
  
  router.get('/login', function(req, res, next) {
    req.toJade.title = "Login";
    res.render('users/login', req.toJade);
  });

  router.post('/login', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    var errs = [];
    req.Student.findOne({username: username}).populate('courses', 'mID title').exec(function(err, user) {
      if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}

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
              //console.log(body);
              if(body.indexOf("url=https://www.regis.org/login.cfm?Failed=1") > -1){
                errs.push("2: Incorrect username or password.");
                done();
              }else{
                console.log("Logged in as "+user.username+" successfully.")
                request({
                    url: 'http://intranet.regis.org/functions/view_profile.cfm', //URL to hit
                    jar: cookieJar,
                    method: 'GET'
                }, function(error, response, html){
                  if(error) {
                      console.log(error);
                      errs.push("1: Failed to register. Please try again later.");
                  }else{
                    var $ = cheerio.load(html);

                    // SUCCESSFULLY LOGGED IN, IS THIS USER REGISTERED?

                    if(user.registered == false){
                      // NO, get his Student ID and register him!
                      var id = $("td:contains('Locker Number:')").next().text().trim();
                      //console.log(id);
                      //user.locker_number = id;
                      user.login_count = 0;
                      user.last_point_login_time = new Date();
                      user.registered_date = new Date();
                      user.registered = true;
                      user.nickname = user.firstName;
                      new req.Log({who: user._id, what: "Registration."}).save();
                    }

                    var uA = user.achievements;
                    achievements.forEach(function(ach){
                      if(uA.indexOf(ach.id) == -1){
                        if(ach.check(user)){
                          user.achievements.push(ach.id);
                          user.points += ach.reward;
                          req.session.info.push("You have been awarded "+ach.reward+" points for achieving '"+ach.name+"'!");
                        }
                      }
                    });

                    user.login_count +=1;

                    // Give points if last time points were given was over 5 minutes ago
                    var fiveMinAgo = moment().subtract(5, 'minutes');
                    if(moment(user.last_point_login_time).isBefore(fiveMinAgo)){
                      user.points += 10;
                      req.session.info.push("You have been rewarded 10 points for logging in.");
                      user.last_point_login_time = new Date();
                    }
                    req.user = user;
                    req.session.currentUser = user;
                    req.session.currentUser.login_time = new Date();
                    user.save();

                    new req.Log({who: user._id, what: "Login."}).save();
                    req.session.quietlogin = false; // The actual user logged in, not an admin
                  }
                  done();
                });
              }
            }
        });
      }
      function done(){
        if(errs.length > 0){
          res.json({errors: errs});
        }else{
          io.sockets.emit('new-login', {username: username});
          res.json({success: true});
        }
      }
    });
  });

  router.get('/logout', function(req, res) {
    if(req.loggedIn){
      io.sockets.emit('new-logout', {username: req.currentUser.username});
      if(req.session.quietlogin == false)
        new req.Log({who: req.currentUser._id, what: "Logout."}).save();

      delete req.session.currentUser;
      delete req.currentUser;
      req.session.info.push("You have successfully logged out.");
    }
    res.redirect('/');
  });

  router.get('/loginas', function(req, res) {
    var username = req.query.user;
    console.log(req.currentUser.username);
    if(req.currentUser && req.currentUser.username == "fmatranga18"){
      delete req.session.currentUser;
      delete req.currentUser;
      req.Student.findOne({username: username}).populate('courses', 'mID title').exec(function(err, user) {
        if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
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

  return {router: router, models: ['Student']}
};
