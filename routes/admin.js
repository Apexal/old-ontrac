var express = require('express');
var router = express.Router();


router.get('/*', function(req, res, next) {
  if(req.currentUser.rank > 4 || req.currentUser.username == "fmatranga18"){
    next();
  }else{
    req.session.errs.push("You are not an admin!");
    res.redirect("/");
  }
});

router.get('/logs', function(req, res) {
  req.toJade.title = "Logs";
  req.Log.find({}).populate('who', 'username firstName lastName').sort({when : -1}).exec(function(err, logs) {
    if(err) throw err;

    if(logs){
      console.log(logs[0]);
      req.toJade.logs = logs;
      res.render('admin/logs', req.toJade);
    }
  });
});

module.exports = function(io) {
  return {router: router, models: []}
};
