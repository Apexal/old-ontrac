var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
  req.toJade.title = "Advisements";
  req.toJade.advisements = false;

  req.Advisement.find({}).populate('students', 'username firstName lastName registered')
    .populate('teacher', 'firstName lastName username').sort({title: 1})
    .exec(function(err, advs){
      if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}

      if (advs){
        advs.forEach(function(ad) {
          var list = [];
          ad.students.forEach(function(s) {
            if(s.registered)
              list.push("<span class='user-badge' data-username='"+s.username+"'>"+s.fullName+"</span>");
          });
          ad.list = list.join(', ');
        });
        req.toJade.advisements = advs;

      }
      res.render('advisement/list', req.toJade);
    });

});

router.get('/chat', function(req, res) {
  req.toJade.title = "Private "+req.currentUser.advisement+" Chat";
  res.render('chat/advchat', req.toJade);
});

router.get('/:advisement', function(req, res){
  var advisement = req.params.advisement;
  req.toJade.title = "Advisement "+advisement;
  req.toJade.advisement = false;

  req.Advisement.findOne({title: advisement}).populate('students', 'username firstName lastName registered ipicture email')
    .populate('teacher', 'ipicture firstName lastName username').sort({title: 1})
    .exec(function(err, adv){
      if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}

      if (adv){
        req.toJade.registered = adv.students.filter(function(value) {
          return value.registered == true;
        });
        var emails = [];
        adv.students.forEach(function(s) {
          emails.push(s.email);
        });

        req.toJade.emails = emails.join(',');
        req.toJade.students = adv.students;
        req.toJade.advisement = adv;
      }
      res.render('advisement/one', req.toJade);
    });
});

module.exports = function(io) {
  return {router: router, models: ['Advisement']}
};
