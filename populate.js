// Database stuff
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schemas = require('./modules/schemas.js');
mongoose.connect('mongodb://127.0.0.1/regis');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'Failed to connect to database:'));
db.once('open', function (callback) {
  console.log('Connected to database');
  var studentSchema = new Schema(schemas.student);

  var teacherSchema = new Schema(schemas.teacher);
  Teacher = mongoose.model('Teacher', teacherSchema);

  var courseSchema = new Schema(schemas.course);

  //courseSchema.methods.getTeacher = function(){
  //  console.log("tID: "+this.tID);
  //  Teacher.findOne({tID : this.tID}, function(err, item){return item;});
  //};

  Course = mongoose.model('Course', courseSchema);

  Student = mongoose.model('Student', studentSchema);

  var daySchema = new Schema(schemas.day);

  Day = mongoose.model('Day', daySchema);

  var advisementSchema = new Schema(schemas.advisement);
  Advisement = mongoose.model('Advisement', advisementSchema);



  // DO STUFF
  
  if(true){
    Student.find({registered: true}, function(err, students) {
      students.forEach(function(s) {
        s.code = undefined;
        s.password = undefined;
        s.registered = false;
        s.verified = false;
        s.points = 0;
        s.login_count = 0;
        s.save();
      });
    });
  }
  
  // Connect courses to students
  if (true){
    var advs = {};
    Student.find({}, function(err, students) {
      if (err) console.log(err);
      if (students) {
        students.forEach(function(s){
          var classes = s.sclasses;
          var courses = [];
          if(classes){
            classes.forEach(function(c) {
              Course.findOne({mID: c}, function(err, cs) {

                if(err) console.log(err);
                if (cs){
                  courses.push(cs._id);
                  console.log("Added Course "+cs.mID+" to Student "+s.mID);
                  s.courses = courses;
                  s.save();
                }

              });
            });
          }

        });
      }
    });
  }


  // Connect advisements to students
  if(true){
    Advisement.find({}, function(err, advs) {
      if (err) console.log(err);
      if (advs) {
        advs.forEach(function(adv) {
          adv.title = adv.title.replace("Advisement ", "");
          adv.save();
          var students = [];

          Student.find({advisement: adv.title}, '_id', function(err, s) {
            if (err) console.log(err);
            if (s) {
              s.forEach(function(student){
                students.push(student._id);
                adv.students = students;
                adv.save();
                console.log("Added Student "+student.mID+" to Advisement "+adv.title);
              });
            }
          });
        });
      }
    });
  }

  if (true){
    Teacher.find({}, function(err, teachers) {
      if (err) console.log(err);
      if (teachers) {
        teachers.forEach(function(t){
          var classes = [];
          if(t.sclasses){
            t.sclasses.forEach(function(mID) {

              Advisement.findOne({mID: mID}, function(err, adv){
                if(err) console.log(err);
                if(adv){
                  adv.teacher = t._id;
                  adv.save();
                }
              });

              Course.findOne({mID: mID}, function(err, course){
                if(err) console.log(err);
                if(course){
                  console.log("Added Course "+mID+" to Teacher "+t.mID);
                  classes.push(course._id);
                  course.teacher = t._id;
                  t.courses = classes;
                  t.save();
                }
              });
            });
          }

        });
      }
    });
  }

});
