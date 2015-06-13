var express = require('express');
var router = express.Router();
var adv = require('../modules/advisements');

router.get('/', function(req, res){
  req.toJade.title = "Advisements";
  req.toJade.adv = {};

  req.User.find({}, function(err, advs){
    if(err) throw err;

    adv.forEach(function(a){
      req.toJade.adv[a] = advs.filter(function (el) {
        return el.advisement == a;
      });
    });

    console.log(req.toJade.adv);
    res.render('advisements', req.toJade);
  });
});

router.get('/:advisement', function(req, res){
  var advisement = req.params.advisement;
  req.toJade.title = "Advisement "+advisement;
  req.toJade.advisement = advisement;

  req.User.find({}, function(err, users){
    req.toJade.users = users.filter(function(el) {return el.advisement == advisement;})
    res.render('advisement', req.toJade);
  });
});

module.exports = router;
