// Database stuff
var mongoose = require('mongoose');
var config = require('./config');
var Schema = mongoose.Schema;
var schemas = require('./schemas');
mongoose.connect('mongodb://127.0.0.1/'+config.db);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'Failed to connect to database:'));
db.once('open', function (callback) {
  console.log('Connected to database'.green.bold);

  var studentSchema = new Schema(schemas.student);
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
        grade = "Sophmore";
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
        ranl = "User";
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
      case 7:
        rank = "Owner";
    }
    return rank;
  });

  var teacherSchema = new Schema(schemas.teacher);
  teacherSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
  });
  var Teacher = mongoose.model('Teacher', teacherSchema);

  var courseSchema = new Schema(schemas.course);

  //courseSchema.methods.getTeacher = function(){
  //  console.log("tID: "+this.tID);
  //  Teacher.findOne({tID : this.tID}, function(err, item){return item;});
  //};

  var Course = mongoose.model('Course', courseSchema);

  /*Course.find({}, function(err, cs) {
    cs.forEach(function(c){
      Teacher.findOne({lastName: c.tID}, function(err, item) {
        if(item){
          c.tID = item.tID;
          c.save();
        }
      })
    });
  });*/

  studentSchema.methods.getClasses = function(cb) {
    return Course.find({}).where('mID').in(this.classes).exec(cb);
  };

  var Student = mongoose.model('Student', studentSchema);

  var daySchema = new Schema(schemas.day);

  daySchema.statics.dueToday = function(username, today, cb){
    return this.findOne({user: username, date: today.toDate()}, cb);
  };

  daySchema.statics.getClosestHWDate = function(username, today, cb){
    return this.find().where('user').equals(username).where('date').gt(today.toDate()).where('items.homework').gt([]).sort({date: 1}).exec(cb);
  };
  var Day = mongoose.model('Day', daySchema);

  var advisementSchema = new Schema(schemas.advisement);
  var Advisement = mongoose.model('Advisement', advisementSchema);

  module.exports.Course = Course;
  module.exports.Teacher = Teacher;
  module.exports.Student = Student;
  module.exports.Advisement = Advisement;
  module.exports.Day = Day;
});
