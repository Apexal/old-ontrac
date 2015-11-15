var express = require('express');
var router = express.Router();

router.get('/api/:date', function(req, res) {
  var dateString = req.params.date;
  var day = false;

  if(moment(dateString, 'YYYY-MM-DD', true).isValid() == false){
    res.json({error: "Bad date."}); // Bad date passed
    return;
  }
  var date = req.toJade.date = moment(dateString, 'YYYY-MM-DD', true); // Good date
  if(req.currentUser.scheduleObject.scheduleDays[date.format("MM/DD/YY")] == undefined){
    res.json({error: "Date passed is not a school day."});
    return;
  }


});

router.get('/:id', function(req, res) {
  var id = req.params.id;
  if(isNaN(id)){req.session.errs.push("Failed to find such an item.");res.redirect(req.baseUrl);return;}


});

module.exports = function(io) {
  return {router: router, models: ['Grade']}
};
