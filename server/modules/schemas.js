// All schemas used in the project are defined here.

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

module.exports = {
  student : {
    mID: Number,
    firstName: String,
    lastName: String,
    username: String,
    code: String,
    mpicture: String,
    ipicture: String,
    bio: String,
    steamlink: String,
    email: String,
    achievements: Array,
    locker_number: String,
    schedule: String,
    scheduleObject: Object,
    nickname: String,
    friends: [{ type: Schema.Types.ObjectId, ref: 'Student'}],
    advisement: String,
    sclasses: Array,
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course'}],
    customLinks: Object,
    rank: {type: Number, default: 1},
    points: {type: Number, default: 0},
    login_count: {type: Number, default: 0},
    last_login_time: {type: Date, default: Date.now},
    last_point_login_time: {type: Date, default: Date.now},
    preferences: Object,
    registered_date: {type: Date, default: Date.now},
    registered: { type: Boolean, default: false },
    trimester_updated_in: Number
  },
  advisement : {
    teacher: {type: Schema.Types.ObjectId, ref: 'Teacher'},
    mID: Number,
  	tID : String,
  	title : String,
    students: [{type: Schema.Types.ObjectId, ref: 'Student', default: []}]
  },
  course : {
    mID: Number,
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher'},
    courseType: String,
    title: String,
    grade: Number,
    students: [{ type: Schema.Types.ObjectId, ref: 'Student', default: []}]
  },
  teacher : {
    mID: Number,
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course', default: []}],
    email: String,
    username: String,
    tID: String,
    image: String,
    code: String,
    schedule: String,
    ipicture: String,
    firstName: String,
    lastName: String,
    department: String,
    ratingCount: {type: Number, default: 0},
    ratings: [{username: String, rating: Number}],
    averageRating: Number,
    ratingStringJSON: String
  },
  log_item: {
    who: String,
    what: String,
    when: {type: Date, default: Date.now}
  },
  hwItem: {
    date: Date,
    username: String,
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    desc: String,
    link: String,
    completed: Boolean
  },
  gradedItem: {
    username: String,
    itemType: String,
    description: String,
    dateTaken: Date,
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    checkpoints: [{date: Date, desc: String, reached: Boolean}],
    numGrade: {type: Number, min: 0, max: 100},
    letterGrade: {type: String, enum: ['F', 'U', 'S-', 'S', 'S+', 'M-', 'M', 'M+', 'H-', 'H', 'H+', 'HH']},
    comments: {type: String, default: "No comment."}
  },
  reminder: {
    username: String,
    desc: String,
    added_date: {type: Date, default: Date.now}
  },
  feedback: {
    feedbackType: String,
    text: String,
    date_sent: {type: Date, default: Date.now}
  },
  dailyThought: {
    username: String,
    date: Date,
    body: String
  }
}
