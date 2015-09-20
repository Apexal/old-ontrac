var express = require('express');
var router = express.Router();
var _ = require("underscore");
var achievements = require("../modules/achievements");
var utils = require("../modules/utils");

/* GET users listing. */
router.get('/', function(req, res, next) {
  req.toJade.title = "Users";
  req.toJade.tableForm = (req.query.table == "1" ? true : false);
  req.toJade.registered = false;
  req.toJade.users = false;

  var perPage = 10;
  var pages = (530/10);
  var pageNum = (req.query.page ? parseInt(req.query.page) : 1);

  req.Student.find({registered: true}, 'registered firstName lastName advisement username rank mpicture ipicture', function(err, registered){
    if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
    if(registered)
      req.toJade.registered = registered;
    req.Student.find({}, 'registered firstName lastName advisement username rank mpicture ipicture')
      .sort({advisement: 1})
      .skip(perPage*(pageNum-1))
      .limit(perPage)
      .exec(function(err, users){
        if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
        if(users){
          req.toJade.users = users;
          req.toJade.pageNum = pageNum;
          req.toJade.prev = ((pageNum-1) <= 0 ? pages : (pageNum-1));
          req.toJade.next = ((pageNum+1) > pages ? 1 : (pageNum+1));
          req.toJade.pages = pages;
        }
        res.render('users/list', req.toJade);
      });
  });


});

router.get("/profile", function(req, res) {
  req.toJade.title = "Your Profile";
  res.render('users/edit', req.toJade);
});

router.post("/profile", function(req, res) {
  var newbio = req.body.newbio;
  var newnickname = req.body.newnickname;
  if(newbio){
    req.session.currentUser.bio = newbio;
    req.session.currentUser.nickname = newnickname;
    req.Student.findOne({username: req.currentUser.username}, function(err, user) {
      if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
      if(user){
        user.bio = newbio;
        user.nickname = newnickname;
        user.save(function(err) {
          if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
          req.session.info.push("Successfully updated profile.");
          done();
        });
      }else{
        done();
      }
    });
  }else{done();}

  function done(){
    res.redirect("/users/"+req.currentUser.username);
  }
});

router.get("/:username", function(req, res){
  var username = req.params.username;
  req.toJade.user = false;
  req.toJade.title = "Not a User";
  req.Student.findOne({username: username}, '-schedule -locker_number').populate('courses', 'tID title mID code').exec(function(err, user) {
    if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}

    if(user){
      user.deepPopulate('courses.teacher', function(err, u) {
        //console.log(u.courses);
        req.toJade.title = user.firstName+" "+user.lastName.charAt(0)+" of "+user.advisement;
        req.toJade.user = u;
        req.toJade.allAchievements = achievements;
        req.toJade.stars = _.range(u.rank+1);

        req.toJade.sInfo = utils.getDayScheduleInfo(user.scheduleArray);

        if(req.currentUser.points > u.points)
          req.toJade.pointdiff = (req.currentUser.points - u.points)+" fewer";
        else if(req.currentUser.points < u.points)
          req.toJade.pointdiff = (u.points - req.currentUser.points)+" more";
        else
          req.toJade.pointdiff = "the same amount of";


        res.render('users/profile', req.toJade);
      });
    }else{
      res.render('users/profile', req.toJade);
    }
  });
});

router.get("/:username/schedule", function(req, res){
  req.Student.findOne({username: req.params.username}, 'firstName lastName schedule code', function(err, user) {
    if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}

    if(user.schedule){
      req.toJade.title = user.firstName+" "+user.lastName.charAt(0)+"'s Schedule";
      req.toJade.url = "StudentCode="+user.code;
      req.toJade.schedule = user.schedule;

      res.render('schedule', req.toJade);
    }else{
      req.session.errs.push('Failed to find a schedule for this user.');
      res.redirect("/users/"+req.params.username);
    }
  });
});

module.exports = function(io) {
  return {router: router, models: ['Student', 'Teacher']}
};