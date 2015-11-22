// Database stuff
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var config = require('../config');
var Schema = mongoose.Schema;
var schemas = require('./schemas');
mongoose.connect(config.db, config.dbauth);
var db = mongoose.connection;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

db.on('error', function(err) {console.error("Failed to connect to Database: "); throw err;});/*console.error.bind(console, 'Failed to connect to database:'));*/
db.once('open', function (callback) {
  console.log('Connected to database "'+config.db+'"\n');

  var studentSchema = new Schema(schemas.student);

  studentSchema.plugin(deepPopulate);

  studentSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
  });

  studentSchema.virtual('grade').get(function () {
    return 8+parseInt(this.advisement.charAt(0));
  });

  studentSchema.virtual('gradeName').get(function () {
    var adv = this.advisement.charAt(0);
    var grade = "";
    switch(adv) {
      case "1":
        grade = "Freshman";
        break;
      case "2":
        grade = "Sophomore";
        break;
      case "3":
        grade = "Junior";
        break;
      case "4":
        grade = "Senior";
        break;
    }
    return grade;
  });

  studentSchema.virtual('rankName').get(function () {
    var rank = this.rank;
    switch(rank) {
      case 0:
        rank = "Guest";
        break;
      case 2:
        rank = "User";
        break;
      case 3:
        rank = "Member";
        break;
      case 4:
        rank = "Operator";
        break;
      case 5:
        rank = "Moderator";
        break;
      case 6:
        rank = "Administrator";
        break;
      case 7:
        rank = "Owner";
    }
    return rank;
  });

  var teacherSchema = new Schema(schemas.teacher);
  teacherSchema.virtual('fullName').get(function() {
    return this.firstName + ' ' + this.lastName;
  });
  teacherSchema.virtual('ratingString').get(function() {
    var r = this.averageRating;
    if(r > 9)
      return "very strongly liked";
    if(r > 8)
      return "very liked";
    if(r > 7)
      return "liked";
    if(r > 6)
      return "mostly liked";
    if(r > 5)
      return "neutrally liked";
    if(r > 4)
      return "slightly disliked";
    return "disliked";
  });
  var Teacher = mongoose.model('Teacher', teacherSchema);

  var courseSchema = new Schema(schemas.course);
  var Course = mongoose.model('Course', courseSchema);

  var Student = mongoose.model('Student', studentSchema);

  var advisementSchema = new Schema(schemas.advisement);
  var Advisement = mongoose.model('Advisement', advisementSchema);

  var logItemSchema = new Schema(schemas.log_item);
  var Log = mongoose.model('Log', logItemSchema);

  var reminderSchema = new Schema(schemas.reminder);
  var Reminder = mongoose.model('Reminder', reminderSchema);

  var feedbackSchema = new Schema(schemas.feedback);
  var Feedback = mongoose.model('Feedback', feedbackSchema);

  var hwItemSchema = new Schema(schemas.hwItem);
  var HWItem = mongoose.model('HWItem', hwItemSchema);

  var gradedItemSchema = new Schema(schemas.gradedItem);
  var GradedItem = mongoose.model('GradedItem', gradedItemSchema);

  module.exports.HWItem = HWItem;
  module.exports.Course = Course;
  module.exports.Teacher = Teacher;
  module.exports.Student = Student;
  module.exports.Advisement = Advisement;
  module.exports.Log = Log;
  module.exports.Reminder = Reminder;
  module.exports.Feedback = Feedback;
});
