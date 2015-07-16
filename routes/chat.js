var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  req.toJade.title = "Regis Chat";

  res.render('chatpage', req.toJade);
});

module.exports = router;
