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
    sclasses: Array,
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course', default: []}],
    rank: {type: Number, default: 0},
    statuses: [{when: Date, text: String, default: []}],
    points: Number,
    login_count: Number,
    last_login_time: Date,
    last_point_login_time: Date,
    preferences: Object,
    registered_date: Date,
    registered: Boolean
  },
  advisement : {
    teacher: {type: Schema.Types.ObjectId, ref: 'Teacher'},
  	tID : String,
  	title : String,
  	mID : Number,
    students: [{type: Schema.Types.ObjectId, ref: 'Student', default: []}]
  },
  course : {
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher'},
    courseType: String,
    mID: Number,
    title: String,
    //tID: String,
    grade: Number,
    students: [{ type: Schema.Types.ObjectId, ref: 'Student', default: []}]
  },
  teacher : {
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course', default: []}],
    email: String,
    tID: String,
    sclasses: Array,
    image: String,
    firstName: String,
    lastName: String,
    mID: Number,
    department: String,
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 }
  },
  day: {
        date: Date,
        scheduleDay: String,
        username: String,
        items: {
          homework: [{ type: Schema.Types.ObjectId, ref: 'HWItem' }],
          tests : [{ type: Schema.Types.ObjectId, ref: 'GradedItem' }],
          quizzes: [{ type: Schema.Types.ObjectId, ref: 'GradedItem' }],
          projects: [{ type: Schema.Types.ObjectId, ref: 'GradedItem' }]
        }
    },
  log_item: {
    who: { type: Schema.Types.ObjectId, ref: 'Student'},
    what: String,
    when: {type: Date, default: Date.now}
  },
  hwItem: {
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    desc: String,
    link: String,
    completed: Boolean
  },
  gradedItem: {
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    num_grade: {type: Number, min: 0, max: 100},
    string_grade: {type: String, enum: ['F', 'U', 'S', 'M', 'H', 'HH']}
  }
}
