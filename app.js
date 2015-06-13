var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var colors = require('colors');
var session = require('express-session');
var bCrypt = require('bcrypt-nodejs');

var moment = require('moment');

var config = require('./modules/config');

// Database stuff
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schemas = require('./modules/schemas.js');
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

  User = mongoose.model('User', userSchema);
});

passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;


passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!isValidPassword(user, password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      user.loginCount +=1;
      user.last_login_time = new Date();
      user.save();
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


var routes = require('./routes/index');
var users = require('./routes/users');
var advisements = require('./routes/advisements');

var school_years = require('./modules/years');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'oh mr savage',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.locals.basedir = path.join(__dirname, 'views');
app.locals.moment = moment;

app.use(function(req, res, next) {
  console.log(("\nRequest from "+req.connection.remoteAddress).blue.bold);

  req.User = User;

  var info = school_years.getCurrent();
  req.year = info.years;
  req.trimester = info.trimester;
  req.full_year = info.full;

  req.today = moment().startOf('day');

  req.toJade = {
    title: "Page",
    year: info.years,
    tri: info.trimester,
    full_year: info.full,
    today: req.today,
    currentUser: req.user,
    loggedIn: req.isAuthenticated()
  }

  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/advisements', advisements);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    req.toJade.title = "Error!";
    req.toJade.message = err.message;
    req.toJade.error = err;
    res.render('error', req.toJade);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}

module.exports = app;
