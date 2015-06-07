var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.toJade.title = "Adiutor";
  res.render('index', req.toJade);
});

router.get('/login', function(req, res, next) {
  req.toJade.title = "Login";
  res.render('users/login', req.toJade);
});

module.exports = router;
