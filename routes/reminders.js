var express = require('express');
var router = express.Router();

router.get("/", function(req, res) {
  console.log("reminders");
});

module.exports = function(io) {
  return {router: router, models: []}
};
