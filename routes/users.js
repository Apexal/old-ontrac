var express = require('express');
var router = express.Router();
var adv = require('../modules/advisements');

/* GET users listing. */
router.get('/', function(req, res, next) {
  req.toJade.title = "Users";
  req.toJade.tableForm = (req.query.table == "1" ? true : false);
  req.Student.find({registered: true}, function(err, users){
    if(err) console.log(err);
    req.toJade.users = users;
    res.render('users/list', req.toJade);
  });
});

router.get("/profile", function(req, res) {
  req.toJade.title = "Your Profile";
});

router.get("/:username", function(req, res){
  req.Student.findOne({registered: true, username: req.params.username}, function(err, user) {
    if(user){
      if(err) console.log(err);
      req.toJade.title = user.firstName+" "+user.lastName.charAt(0)+" of "+user.advisement;
      req.toJade.user = user;

      user.getClasses(function(err, classes){
        if(err) console.log(err);
        //console.log(classes);
        req.toJade.classes = classes;
        console.log(classes[4].getTeacher().tID);
        res.render('users/profile', req.toJade);
      });
    }else{
      res.redirect("/users");
    }
  });
});

router.get("/:username/schedule", function(req, res){
  req.Student.findOne({registered: true, username: req.params.username}, function(err, user) {
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
