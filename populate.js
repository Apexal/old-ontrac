var mongo = require("./modules/mongodb");

setTimeout(function() {
  Course = mongo.Course;
  Student = mongo.Student;
  Advisement = mongo.Advisement;
  Teacher = mongo.Teacher;
  Day = mongo.Day;

    // DO STUFF

  if(true){
    Course.find({}, function(err, courses){
      courses.forEach(function(c){c.students = []; c.save();});
    });
  }

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
          if(!s.mpicture){
            s.mpicture = "/images/person-placeholder.jpg";
            s.save();
          }
          if(classes){
            classes.forEach(function(c) {
              Course.findOne({mID: c}, function(err, cs) {
                if(err) console.log(err);
                if (cs){
                  courses.push(cs._id);
                  cs.students.push(s._id);
                  //console.log(cs.students);
                  cs.save(function(err) {
                    if(err) console.log(err);
                    else console.log("Added Student "+s.mID + " to Course "+cs.mID);
                  })
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

}, 1000);
