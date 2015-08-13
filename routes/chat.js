var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  req.toJade.title = "Regis Chat";

  res.render('chat/chatpage', req.toJade);
});

module.exports = function(io) {
  return {router: router, models: []}
};
