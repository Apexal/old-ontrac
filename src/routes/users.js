var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  req.toJade.title = "Users";
  req.toJade.tableForm = (req.query.table == "1" ? true : false);
  req.toJade.registered = false;
  req.toJade.users = false;

  var perPage = 10;
  var pages = (530/10);
  var pageNum = (req.query.page ? parseInt(req.query.page) : 1);

  req.Student.find({registered: true}, function(err, registered){
    if(err) console.log(err);
    if(registered)
      req.toJade.registered = registered;
    req.Student.find({}, 'registered firstName lastName advisement code username rank mpicture')
      .sort({advisement: 1})
      .skip(perPage*(pageNum-1))
      .limit(perPage)
      .exec(function(err, users){
        if(err) console.log(err);
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
});

router.get("/:username", function(req, res){
  var username = req.params.username;
  req.toJade.user = false;
  req.toJade.title = "Not a User";
  req.Student.findOne({username: username}).populate('courses', 'tID title mID code').exec(function(err, user) {
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
  req.Student.findOne({username: req.params.username}, function(err, user) {
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
