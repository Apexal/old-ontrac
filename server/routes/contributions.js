var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  req.toJade.title = "Your Contributions";
  res.render('contributions/index', req.toJade);
});

module.exports = function(io) {
  return {router: router, models: []}
};
