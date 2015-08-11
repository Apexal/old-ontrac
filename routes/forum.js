var express = require('express');
var router = express.Router();


module.exports = function(io) {
  return {router: router, models: []}
};
