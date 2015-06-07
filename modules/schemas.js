module.exports = {
  user : {
    firstName: String,
    lastName: String,
    username: String,
    code: String,
    email: { type: String, required: true, unique: true },
    advisement: String,
    classes: Array,
    password: {type: String, required: true},
    rank: Number,
    points: Number,
    loginCount: Number,
    last_login_time: Date,
    last_point_login_time: Date,
    preferences: Object
  }
}
