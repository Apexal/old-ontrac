var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  req.toJade.title = "Point Shop";
  res.render('shop/index', req.toJade);
});

module.exports = function(io) {
  return {router: router, models: []}
};
