var express = require('express');
var router = express.Router();
var adv = require('../modules/advisements');
redir = "/";

/* GET home page. */
router.get('/', function(req, res, next) {
  req.toJade.title = "Adiutor";
  res.render('index', req.toJade);
});

router.get('/login', function(req, res, next) {
  req.toJade.title = "Login";
  req.toJade.redir = (req.query.redir ? req.query.redir : "/")
  res.render('users/login', req.toJade);
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  res.redirect(req.query.redir);
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

router.get('/forgot', function(req, res) {

});

module.exports = router;
