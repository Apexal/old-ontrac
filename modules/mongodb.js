// Database stuff
var mongoose = require('mongoose');
var config = require('./config');
var Schema = mongoose.Schema;
var schemas = require('./schemas.js');
mongoose.connect('mongodb://127.0.0.1/'+config.db);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'Failed to connect to database:'));
db.once('open', function (callback) {
  console.log('Connected to database');
  var userSchema = new Schema(schemas.user);
  userSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
  });

  userSchema.virtual('grade').get(function () {
    return 8+parseInt(this.advisement.charAt(0));
  });

  userSchema.virtual('gradeName').get(function () {
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

  userSchema.virtual('rankName').get(function () {
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


  var teacherSchema = Schema(schemas.teacher);


  module.exports.Teacher = mongoose.model('Teacher', teacherSchema);
  module.exports.User = mongoose.model('User', userSchema);
});
