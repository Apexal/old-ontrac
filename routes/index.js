var express = require('express');
var router = express.Router();
var adv = require('../modules/advisements');

/* GET home page. */
router.get('/', function(req, res, next) {
  req.toJade.title = "Adiutor";
  res.render('index', req.toJade);
});

router.get('/login', function(req, res, next) {
  req.toJade.title = "Login";
  res.render('users/login', req.toJade);
});

router.get('/register', function(req, res) {
  req.toJade.title = "Register";
  req.toJade.adv = adv;
  res.render('users/register', req.toJade);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
