var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  req.toJade.title = "Yes, It's True";
  res.render('preppy', req.toJade);
});

module.exports = function(io) {
  return {router: router, models: []}
};
