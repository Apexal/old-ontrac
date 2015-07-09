var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

module.exports = {
  student : {
    mID: Number,
    firstName: String,
    lastName: String,
    username: String,
    code: String,
    email: String,
    advisement: String,
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course'}],
    password: {type: String, required: true},
    rank: Number,
    statuses: [{when: Date, text: String}],
    points: Number,
    login_count: Number,
    last_login_time: Date,
    last_point_login_time: Date,
    preferences: Object,
    verified: Boolean,
    registered_date: Date,
    registered: Boolean
  },
  advisement : {
    _teacher: {type: Schema.Types.ObjectId, ref: 'Teacher'},
  	tID : String,
  	grade : Number,
  	title : String,
  	mID : Number,
    students: [{type: Schema.Types.ObjectId, ref: 'Student'}]
  },
  course : {
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher'},
    courseType: String,
    mID: Number,
    title: String,
    tID: String,
    grade: Number,
    students: [{ type: Schema.Types.ObjectId, ref: 'Student'}]
  },
  teacher : {
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course'}],
    email: String,
    tID: String,
    image: String,
    firstName: String,
    lastName: String,
    mID: Number,
    department: String
  },
  day: {
        date: Date,
        scheduleDay: String,
        user: String,
        items: {
          homework: [
              {
              	courseID: Number,
              	assignment: String,
              	link: String,
              	completed: Boolean
              }
          ],
          tests : [],
          quizzes: [],
          projects: []
        }
    }
}
