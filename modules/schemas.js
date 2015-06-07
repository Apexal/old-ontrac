module.exports = {
  user : {
    username: String,
    email: { type: String, required: true, unique: true },
    password: {type: String, required: true},
    rank: Number,
    points: Number,
    loginCount: Number,
    last_login_time: Date,
    last_point_login_time: Date,
    preferences: Object
  }
}
