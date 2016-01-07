var express = require('express');
var router = express.Router();
var moment = require('moment');
var request = require("request-promise");
var cheerio = require("cheerio");
var schedules = require("../modules/schedule");
var achievements = require("../modules/achievements");
var secrets = require("../secrets.json");

var redir = "/";

module.exports = function(io) {
  /* GET home page. */
  router.get(['/', '/home'], function(req, res, next) {
    req.toJade.title = "OnTrac";
    console.log(req.trimester);
    if(req.loggedIn){
      req.toJade.title = "Your Home";
      res.render('home/homepage', req.toJade);
    }else{
      res.render('home/index', req.toJade);
    }
  });

  // THE SP00KY LOGIN SYSTEM
  router.post('/login', function(req, res, next) {
    var username = req.body.username.trim();
    var password = req.body.password.trim();
    if(!username || !password){
      finalize("Please enter a username and password.");
    }
    console.log("ATTEMPTING TO LOGIN AS "+username+": \n");
    var errs = [];

    var cookieJar = request.jar();
    var user = null;
    req.Student.findOne({username: username})
      .populate('courses', 'title mID')
      .exec()
      .then(function(u){
        if(!u){throw "Incorrect username or password.";}
        user = u;
        if(u.locked){
          new req.Log({who: user.username, what: "Login attempt on locked account."}).save();
          throw "Your account is locked by an admin!";
        }
        adv = u.advisement;
        // The username passed exists
         // For the session
        return request({
          url: 'https://intranet.regis.org/login/submit.cfm', //URL that the login form on the Intranet points to
          jar: cookieJar,
          method: 'POST',
          //Lets post the following key/values as form
          form: {
            username: username,
            password: password
          },
          resolveWithFullResponse: true,
          simple: false
        });
      })
      .then(function(response){
        var body = response.body;
        if(body.indexOf("url=https://www.regis.org/login.cfm?Failed=1") > -1){
          throw "Incorrect username or password.";
        }else{
          console.log("LOGGED IN TO INTRANET");
          //LOGGED IN TO INTRANET SUCCESSFULLY (THIS IS A REAL USER)
          if(user.registered == false || user.trimester_updated_in != req.trimester){
            // NOT REGISTERED, get his Student ID and register him!
            if(user.registered == false){
              console.log("FIRST LOGIN FOR "+username);
              user.rank = 1;
              user.login_count = 0;
              user.last_point_login_time = new Date();
              user.registered_date = new Date();
              user.registered = true;
              user.nickname = user.firstName;

              if(user.username == "fmatranga18")
                user.rank = 7;

              var welcomeText = "<h1><b>Welcome to OnTrac!</b></h1><br><br><p>You are now an official <b>Alpha Tester</b> for <b>OnTrac!</b>. Remember, this service is still in early development" +
                "and is <i>not</i> yet totally ready. It is in very active development and new (and potentially unstable) features are added very frequently.</p><br>It is now your job to " +
                "report <b>ANY AND ALL</b> bugs small or large and recommend <b>ANY AND ALL</b> ideas you have small or large.";
              require("../modules/mailer")(user.email, "Welcome!", welcomeText);
            }else{
              console.log("UPDATING INFO FOR "+username);
            }
            console.log("DOWNLOADING CLASS SCHEDULE FOR "+username);
            return request({
              url: 'http://intranet.regis.org/downloads/outlook_calendar_import/outlook_schedule_download.cfm', //URL to hit
              jar: cookieJar,
              method: 'GET',
              resolveWithFullResponse: true,
              simple: false
            });
          }
        }
      })
      .then(function(response) {
        if(response){
          console.log("PARSING TRIMESTER "+req.trimester+" SCHEDULE FOR "+username);
          var body = response.body;
          user.scheduleObject = schedules.generateSchedule(body, req.trimester, user);
          user.trimester_updated_in = req.trimester;

          new req.Log({who: user.username, what: "Registration."}).save();
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
        req.session.currentUser.last_login_time = new Date();
        var sd = user.scheduleObject.scheduleDays[moment().format("YYYY-MM-DD")];
        if(sd){
          //console.log(user.scheduleObject.dayClasses);
          req.session.todaysInfo = {scheduleDay: sd, periods: user.scheduleObject.dayClasses[sd]};
          //console.log(req.session.todaysInfo);
        }



        return request({
          url: 'http://intranet.regis.org/calendar/qry_searchresults.cfm', //URL that the login form on the Intranet points to
          jar: cookieJar,
          method: 'POST',
          //Lets post the following key/values as form
          form: {
            SearchCriteria: adv.split("-")[0]
          },
          resolveWithFullResponse: true,
          simple: false
        });
      }).then(function(response) {
        var body = response.body;
        //console.log(body);
        $ = cheerio.load(body);

        var items = [];
        $("li[type='square'] a").each(function(i, e) {
          var date = $(this).parent().parent().parent().find('td').last().text().trim();
          var parsed = moment(date, "ddd, MMM. D, YYYY");
          //Mon, Dec. 15, 2014'
          var advs = $(this).text().split(";");
          var l = advs.length;

          var subject = advs[l-1].trim().split(",")[0];
          if(advs.indexOf(adv) > -1 || advs.indexOf(adv.split("-")[0]) > -1)
            items.push({course:subject, date: parsed});
        });

        items = items.filter(function(i) {
          return (i.date.isAfter(moment().subtract(1, 'days')));
        });
        items.forEach(function(i) {
          var cID = user.courses.filter(function (c) {
            return (c.title.indexOf(i.course) > -1 || c.title == i.course || i.course.indexOf(c.title) > -1);
          })[0].id;
          req.GradedItem.count({username: username, course: cID, dateTaken: i.date.toDate()}, function(err, count) {
            if(err){throw "Failed to get tests!";}
            if(count == 0){
              new req.GradedItem({
                username: username,
                itemType: "test",
                course: cID,
                dateTaken: i.date.toDate()
              }).save(function(err) {
                if(err){
                  throw "Failed to get tests!";
                }
                new req.Log({who: user.username, what: "Login added new GradedItem."}).save();
              });
            }
          });
        });

        user.save(function(err) {
          if(err) throw(err);
          new req.Log({who: user.username, what: "Login."}).save();
          req.session.quietlogin = false;
          res.json({success: true});
        });
      })
      .catch(function(err) {
        console.log(err);
        if(err !== null){
          err = err.message || err;
          res.json({errors: [err]});
          return;
       }
      });
  });

  router.get('/logout', function(req, res) {
    if(req.loggedIn){
      if(req.session.quietlogin == false){
        new req.Log({who: req.currentUser.username, what: "Logout."}).save();
      }
      io.sockets.emit('new-logout', {username: req.currentUser.username});
      delete req.session.currentUser;
      delete req.currentUser;
      delete req.loggedIn;
      delete req.session.todaysInfo;
      delete req.query.redir;
      req.session.info.push("You have successfully logged out.");
    }
    res.redirect('/');
  });

  router.post("/shutdown", function(req, res){
    if(req.body.password == secrets.regis_password){
      process.exit();
    }else{
      req.session.errs.push("Incorrect password.");
      res.redirect("/home");
    }
  });


  // ADMIN ONLY: Secretly login to other users to test features
  router.get('/loginas', function(req, res) {
    var username = req.query.user;
    if(req.currentUser && req.currentUser.username == "fmatranga18"){
      // Same as Logout basically
      delete req.session.currentUser;
      delete req.session.todaysInfo;
      delete req.currentUser;
      req.Student.findOne({username: username, registered: true})
        .populate('courses', 'title mID')
        .exec(function(err, user) {
          if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
          if(user){
            var sd = user.scheduleObject.scheduleDays[moment().format("YYYY-MM-DD")];
            if(sd){
              //console.log(user.scheduleObject.dayClasses);
              req.session.todaysInfo = {scheduleDay: sd, periods: user.scheduleObject.dayClasses[sd]};
              //console.log(req.session.todaysInfo);
            }
            req.session.quietlogin = true;
            req.user = user;
            req.session.currentUser = user;
            res.redirect("/");
          }else{
            req.session.info.push("No such registered user!");
            res.redirect('/');
          }
        });
    }else{
      req.session.info.push("Only admins can do that!");
      res.redirect('/');
    }
  });

  router.get('/gchat', function(req, res){
    req.toJade.title = "Global Chat";
    res.render('chat/chatpage', req.toJade);
  });

  return {router: router, noLogin: true, models: ['Student', 'GradedItem']}
};
