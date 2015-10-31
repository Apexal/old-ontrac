var express = require('express');
var router = express.Router();

router.post('/teachers/:mID', function(req, res) {
  var mID = req.params.mID;
  var rating = req.body.rating;
  req.Teacher.findOne({_id: mID}, function(err, teacher) {
    if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
    if(teacher && (rating >= 0 && rating <= 10)){
      var firstRate = true; // Has the logged in user rated this teacher before?
      for(var rate in teacher.ratings){
        var curr = teacher.ratings[rate];
        if(curr.username == req.currentUser.username)
          firstRate = false;
      }
      var total = 0;
      console.log("firstRate: "+firstRate);
      if(firstRate){
        teacher.ratingCount += 1;
        teacher.ratings.push({username: req.currentUser.username, rating: rating});
      }else{
        for(var rate in teacher.ratings){
          var curr = teacher.ratings[rate];
          if(curr.username == req.currentUser.username){
            teacher.ratings[rate].rating = rating;
            console.log("Updated rate to "+rating);
            console.log(teacher.ratings[rate].rating);
          }
        }
      }

      for(var rate in teacher.ratings){
        var curr = teacher.ratings[rate];
        if(isNaN(curr.rating) == false){
          total+=curr.rating;
          console.log(curr);
        }
      }
      console.log(total);
      teacher.averageRating = (total / teacher.ratingCount);

      teacher.save(function(err) {
        if(err){req.session.errs.push('An error occured, please try again.'); res.redirect(req.baseUrl); return;}
        res.json({success: true});
      });
    }else{
      res.json({error: "Oh you thought you could break this, didn't you?"})
    }
  });
});

module.exports = function(io) {
  return {router: router, models: ['Teacher']}
};
