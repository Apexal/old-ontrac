module.exports = {
  student : {
    mID: Number,
    firstName: String,
    lastName: String,
    username: String,
    code: String,
    email: String,
    advisement: String,
    classes: Array,
    password: {type: String, required: true},
    rank: Number,
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
  	tID : String,
  	grade : Number,
  	title : String,
  	courseType : String,
  	mID : Number
  },
  course : {
    courseType: String,
    mID: Number,
    title: String,
    tID: String,
    grade: Number
  },
  teacher : {
    email: String,
    tID: String,
    firstName: String,
    lastName: String
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
