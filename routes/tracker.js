var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  console.log("tracker");
});

module.exports.models = [];
module.exports.router = router;
