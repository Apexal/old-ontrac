var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  req.toJade.title = "Your Grades";
  req.GradedItem.find({username: req.currentUser.username})
    .populate('course', 'title mID')
    .exec(function(err, grades) {
      if(err){req.session.errs.push("Failed get all grades.");res.redirect(req.baseUrl);return;}
      req.toJade.grades = grades;
      res.render('grades/index', req.toJade);
    });
});

router.post('/add', function(req, res) {
  console.log(req.body);
  var itemType = req.body.newGradeItemType;
  var desc = req.body.newGradeDesc;
  var courseID = req.body.newGradeCourseID;
  var numGrade = (req.body.gradeType == "number" ? req.body.newGradeNumber : null);
  var letterGrade = (req.body.gradeType == "letter" ? req.body.newGradeLetter : null);
  var comments = req.body.newGradeComments;

  if(!itemType || !courseID || (!letterGrade && !numGrade)){
    req.session.errs.push('Please enter ALL required fields.'); res.redirect(req.baseUrl); return;
  }else{
    var props = {
      username: req.currentUser.username,
      dateTaken: new Date(),
      itemType: itemType,
      description: desc,
      course: courseID
    };
    if(numGrade)
      props.numGrade = numGrade;
    else
      props.letterGrade = letterGrade;
    var newGrade = new req.GradedItem(props);
    newGrade.save(function(err) {
      if(err){req.session.errs.push("Failed to save the grade. Please try again.");res.redirect(req.baseUrl);return;}
      res.redirect("/grades");
    });
  }
});

router.get('/api/:date', function(req, res) {
  var dateString = req.params.date;
  var day = false;

  if(moment(dateString, 'YYYY-MM-DD', true).isValid() == false){
    res.json({error: "Bad date."}); // Bad date passed
    return;
  }
  var date = req.toJade.date = moment(dateString, 'YYYY-MM-DD', true); // Good date
  if(req.currentUser.scheduleObject.scheduleDays[dateString] == undefined){
    res.json({error: "Date passed is not a school day."});
    return;
  }
});

router.get('/:id', function(req, res) {
  var id = req.params.id;
  if(isNaN(id)){req.session.errs.push("Failed to find such an item.");res.redirect(req.baseUrl);return;}


});

module.exports = function(io) {
  return {router: router, models: ['GradedItem']}
};
