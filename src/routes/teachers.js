var express = require('express');
var router = express.Router();

router.get("/", function(req, res, next) {
  req.toJade.title = "Teachers";
  req.toJade.teachers = false;

  var perPage = 10;
  var pages = (270/10);
  var pageNum = (req.query.page ? parseInt(req.query.page) : 1);

  var sortBy = (req.query.sortBy ? req.query.sortBy : "");
  req.Teacher.find({}, 'firstName lastName department mpicture ipicture')
    .sort({sortBy: -1})
    .skip(perPage*(pageNum-1)).limit(perPage)
    .exec(function(err, teachers) {
      if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
      if(teachers){
        req.toJade.pageNum = pageNum;
        req.toJade.prev = ((pageNum-1) <= 0 ? pages : (pageNum-1));
        req.toJade.next = ((pageNum+1) > pages ? 1 : (pageNum+1));
        req.toJade.pages = pages;

        req.toJade.teachers = teachers;
      };
      req.toJade.sortBy = sortBy;
      res.render('teachers/list', req.toJade);
    });
});

router.get("/:mID", function(req, res, next) {
  var mID = req.params.mID;
  req.toJade.teacher = false;

  req.Teacher.findOne({mID: mID}).populate('courses', 'mID title').exec(function(err, teacher) {
    if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
    console.log(teacher);
    if(teacher !== null) {
      req.toJade.title = "Teacher "+teacher.fullName;
      req.toJade.teacher = teacher;
    }
    res.render('teachers/profile', req.toJade);
  });
});

router.get("/:tID/schedule", function(req, res, next) {
  var tID = req.params.tID;
  req.toJade.teacher = false;

  req.Teacher.findOne({tID: tID}, function(err, teacher) {
    if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}

    if(teacher) {
      req.toJade.title = "Teacher "+teacher.firstName.charAt(0)+". "+teacher.lastName;
      req.toJade.teacher = teacher;
    }
    res.render('teachers/profile', req.toJade);
  });
});

module.exports = function(io) {
  return {router: router, models: ['Teacher']}
};
