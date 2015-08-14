var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  req.toJade.title = "Users";
  req.toJade.tableForm = (req.query.table == "1" ? true : false);

  req.Student.find({}, 'registered firstName lastName advisement code username rank mpicture').sort({advisement: 1}).exec(function(err, users){
    if(err) console.log(err);
    req.toJade.users = users;
    req.toJade.registered = users.filter(function(user) {
      //console.log((user.registered == true ? user.username : ""));
      return (user.registered == true);
    });
    res.render('users/list', req.toJade);
  });
});

router.get("/profile", function(req, res) {
  req.toJade.title = "Your Profile";
});

router.get("/:username", function(req, res){
  var username = req.params.username;
  req.toJade.user = false;
  req.toJade.title = "Not a User";

  req.Student.findOne({registered: true, username: username}).populate('courses', 'tID title mID').exec(function(err, user) {
    if(err) throw err;

    if(user){
      user.deepPopulate('courses.teacher', function(err, u) {
        //console.log(u.courses);
        req.toJade.title = user.firstName+" "+user.lastName.charAt(0)+" of "+user.advisement;
        req.toJade.user = u;
        res.render('users/profile', req.toJade);
      });
    }else{
      res.render('users/profile', req.toJade);
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


module.exports = function(io) {
  return {router: router, models: ['Student', 'Teacher']}
};
