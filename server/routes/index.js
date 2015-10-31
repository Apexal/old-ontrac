var express = require('express');
var router = express.Router();
var moment = require('moment');
var request = require("request");
var cheerio = require("cheerio");
var schedules = require("../modules/schedule");
var achievements = require("../modules/achievements");
var secrets = require("../secrets.json");

var redir = "/";

module.exports = function(io) {
  /* GET home page. */
  router.get(['/', '/home'], function(req, res, next) {
    req.toJade.title = "OnTrac";
    if(req.loggedIn){
      req.toJade.title = "Your Home";
      req.toJade.nextCD = schedules.getNextDay(moment(), req.currentUser.scheduleObject);
      req.toJade.nextSD = req.currentUser.scheduleObject.scheduleDays[req.toJade.nextCD];
      res.render('home/homepage', req.toJade);
    }else{
      res.render('home/index', req.toJade);
    }
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

        // ATTEMPT INTRANET LOGIN
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
                      user.locker_number = id;
                      user.login_count = 0;
                      user.last_point_login_time = new Date();
                      user.registered_date = new Date();
                      user.registered = true;
                      user.nickname = user.firstName;

                      if(user.username == "fmatranga18")
                        user.rank = 7;

                      request({
                          url: 'http://intranet.regis.org/downloads/outlook_calendar_import/outlook_schedule_download.cfm', //URL to hit
                          jar: cookieJar,
                          method: 'GET'
                      }, function(error, response, text){
                        var scheduleLines = text.match(/[^\r\n]+/g);
                        var good = [];
                        var schedule = {
                          scheduleDays: {},
                          dayClasses: {}
                          /*
                          scheduleDays: {
                            '09/22/15': 'E'
                          },
                          dayClasses: {
                            'A': [A DAY CLASSES],
                            etc...
                          }
                          */
                        };

                        scheduleLines.forEach(function(line) {
                          good.push(line.split("\t"));
                        });
                        var actualClassses = [];
                        good.forEach(function(line) {
                          var dateS = line[0]; // String date in format MM/DD/YY
                          if(moment(dateS, "MM/DD/YY").isValid()){
                            if(line[4].indexOf(" Day") > -1){ // This line is stating a Schedule Day
                              schedule.scheduleDays[dateS] = line[4].replace(" Day", "");
                            }else{
                              actualClassses.push(line);
                            }
                          }
                        });

                        actualClassses = actualClassses.slice(0, 60);
                        //console.log(actualClassses);

                        var doneF = false;
                        var i = 0;
                        while(doneF == false && i < actualClassses.length){
                          var line = actualClassses[i];
                          var dateS = line[0];
                          var sd = schedule.scheduleDays[dateS];

                          if(!schedule.dayClasses[sd])
                            schedule.dayClasses[sd] = [];

                          var room = (isNaN(line[5]) ? line[5] : "Room "+line[5]);

                          var period = {
                            //date: moment(line[0], "MM/DD/YY").toDate(),
                            startTime: line[1],
                            endTime: line[3],
                            className: line[4],
                            room: room
                          };

                          var length = schedule.dayClasses[sd].filter(function(p){
                            if(p.className == line[4])
                              return true;
                            return false;
                          }).length;
                          if(length == 0)
                            schedule.dayClasses[sd].push(period);

                          i ++;
                        }

                        user.scheduleObject = schedule;
                        ['A', 'B', 'C', 'D', 'E'].forEach(function(sd){
                          var filledPeriods = [];
                          // AM ADVISEMENT
                          var amAdv = {
                            startTime: '08:40 AM',
                            endTime: '08:50 AM',
                            className: 'Morning Advisement',
                            room: 'Homeroom'
                          };
                          filledPeriods.push(amAdv);

                          var periods = schedule.dayClasses[sd];
                          var lastPeriod = amAdv;

                          periods.forEach(function(period) {
                            if(lastPeriod.endTime !== period.startTime){
                              var room = "Anywhere";
                              var cName = "Unstructured Time";
                              var grade = user.grade;
                              var lunch = moment(lastPeriod.endTime, "hh:mm A").startOf('day').hour(11).minute(30);
                              switch(grade){
                                case 9:
                                case 10:
                                  lunch = moment(lastPeriod.endTime, "hh:mm A").startOf('day').hour(11).minute(30);
                                  break;
                                case 11:
                                case 12:
                                  lunch = moment(lastPeriod.endTime, "hh:mm A").startOf('day').hour(12).minute(10);
                                  break;
                              }
                              if(moment(lastPeriod.endTime, "hh:mm A").isSame(lunch)){
                                filledPeriods.push({
                                  room: "Cafeteria",
                                  startTime: lunch.format("hh:mm A"),
                                  endTime: moment(lunch).add(40, 'minutes').format("hh:mm A"),
                                  className: "Lunch"
                                });
                              }else{
                                filledPeriods.push({
                                  room: "Anywhere",
                                  startTime: lastPeriod.endTime,
                                  endTime: period.startTime,
                                  className: "Unstructured Time"
                                });
                              }
                            }

                            var myC = user.courses;
                            myC.forEach(function(course) {
                              if(period.className.indexOf(course.title) > -1){
                                period.mID = course._id;
                              }
                            });

                            lastPeriod = period;
                            filledPeriods.push(period);
                          });

                          // End of day free
                          if(filledPeriods[filledPeriods.length-1].endTime !== "02:50 PM"){
                            filledPeriods.push({
                              room: "Anywhere",
                              startTime: lastPeriod.endTime,
                              endTime: "02:50 PM",
                              className: "Unstructured Time"
                            });
                          }

                          // PM ADVISEMENT
                          filledPeriods.push({
                            startTime: '02:50 PM',
                            endTime: '02:55 PM',
                            className: 'Afternoon Advisement',
                            room: 'Homeroom'
                          });

                          schedule.dayClasses[sd] = filledPeriods;
                        });

                        console.log(schedule);
                        user.scheduleObject = schedule;
                        done();
                      });

                      new req.Log({who: user._id, what: "Registration."}).save();
                      if(req.toJade.production){
                        require("../modules/mailer")(user.email, "Welcome to OnTrac!",
                          "Hello, "+user.firstName+". Thank you for using OnTrac. It \
                          is currently in Alpha, meaning it has not fully been released \
                          yet and is in active development. Thank you for being an Alpha Tester!");
                      }
                    }else{
                      done();
                    }



                  }

                });
              }
            }
        });
      }
      function done(){
        if(errs.length > 0){
          res.json({errors: errs});
        }else{

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

          var sd = user.scheduleObject.scheduleDays[moment().format("MM/DD/YY")];
          if(sd){
            //console.log(user.scheduleObject.dayClasses);
            req.session.todaysInfo = {scheduleDay: sd, periods: user.scheduleObject.dayClasses[sd]};
            console.log(req.session.todaysInfo);
          }

          new req.Log({who: user._id, what: "Login."}).save();
          req.session.quietlogin = false; // The actual user logged in, not an admin

          io.sockets.emit('new-login', {username: username});
          res.json({success: true});
        }

      }
    });
  });

  router.get('/logout', function(req, res) {
    if(req.loggedIn){

      if(req.session.quietlogin == false){
        new req.Log({who: req.currentUser._id, what: "Logout."}).save();
        io.sockets.emit('new-logout', {username: req.currentUser.username});
      }

      delete req.session.currentUser;
      delete req.currentUser;
      delete req.loggedIn;
      delete req.session.todaysInfo;
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
      req.Student.findOne({username: username}).populate('courses', 'mID title').exec(function(err, user) {
        if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
        if(user){
          var sd = user.scheduleObject.scheduleDays[moment().format("MM/DD/YY")];
          if(sd){
            //console.log(user.scheduleObject.dayClasses);
            req.session.todaysInfo = {scheduleDay: sd, periods: user.scheduleObject.dayClasses[sd]};
            console.log(req.session.todaysInfo);
          }
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

  router.get('/gchat', function(req, res){
    req.toJade.title = "Global Chat";
    res.render('chat/chatpage', req.toJade);
  });

  return {router: router, models: ['Student']}
};
