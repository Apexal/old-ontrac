var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
  req.toJade.title = "Advisements";
  req.toJade.advisements = false;

  req.Advisement.find({}).populate('students', 'username firstName lastName registered').populate('teacher', 'image mID firstName lastName').sort({title: 1}).exec(function(err, advs){
    if(err) throw err;

    if (advs){
      req.toJade.advisements = advs;
    }
    res.render('advisement/list', req.toJade);
  });

});

router.get('/:advisement', function(req, res){
  var advisement = req.params.advisement;
  req.toJade.title = "Advisement "+advisement;
  req.toJade.advisement = false;

  req.Advisement.findOne({title: advisement}).populate('students', 'username firstName lastName registered').populate('teacher', 'image mID firstName lastName').sort({title: 1}).exec(function(err, adv){
    if(err) throw err;

    if (adv){
      req.toJade.registered = adv.students.filter(function(value) {
        return value.registered == true;
      })
      req.toJade.advisement = adv;
    }
    res.render('advisement/one', req.toJade);
  });
});

module.exports = router;
