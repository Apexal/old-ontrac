var express = require('express');
var router = express.Router();
var adv = require('../modules/advisements');

/* GET users listing. */
router.get('/', function(req, res, next) {
  req.toJade.title = "Users";
  req.toJade.tableForm = (req.query.table == "1" ? true : false);
  req.User.find({}, function(err, users){
    if(err) console.log(err);
    req.toJade.users = users;
    res.render('users/list', req.toJade);
  });
});


router.get("/:username", function(req, res){
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
