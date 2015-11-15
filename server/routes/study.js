var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  req.toJade.title = "Study Management";
  res.render('study/index', req.toJade);
});

module.exports = function(io) {
  return {router: router, models: ['HWItem', 'Course']}
};
