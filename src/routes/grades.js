var express = require('express');
var router = express.Router();

router.get("/", function(req, res) {
  var adv = req.currentUser.advisement.charAt(0);
  var grade = "";
  switch(adv) {
    case "1":
      grade = "Freshman";
      break;
    case "2":
      grade = "Sophmore";
      break;
    case "3":
      grade = "Junior";
      break;
    case "4":
      grade = "Senior";
      break;
  }

  req.toJade.title = "Your "+grade + " Academic Progress";

  res.render('grade/index', req.toJade);
});

module.exports = function(io) {
  return {router: router, models: ['Grade']}
};
