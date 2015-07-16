var express = require("express")
  , app = express()
  , http = require("http").createServer(app)
  , bodyParser = require("body-parser")
  , io = require("socket.io").listen(http)
  , _ = require("underscore");

var fs = require("fs");
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var colors = require('colors');
var session = require('express-session');
var bCrypt = require('bcrypt-nodejs');
var helpers = require('./modules/helpers');

var moment = require('moment');
var config = require('./modules/config');
var mongo = require('./modules/mongodb');



var connected = 0;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var sessionMiddleware = session({
  secret: 'oh mr savage',
  resave: false,
  saveUninitialized: true
});

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});
app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, 'public')));
app.locals.basedir = path.join(__dirname, 'views');
app.locals.moment = moment;
app.locals.helpers = helpers;

app.use(function(req, res, next) {
  console.log(("\nRequest from "+req.connection.remoteAddress).blue.bold +(req.session.currentUser ? " by "+req.session.currentUser.username : " "));
  req.session.loggedIn = (req.session.currentUser ? true : false);
  req.Student = mongo.Student;

  var info = school_years.getCurrent();
  req.year = info.years;
  req.trimester = info.trimester;
  req.full_year = info.full;

  req.today = moment().startOf('day');

  req.toJade = {
    info: (req.session.info ? req.session.info : []),
    errs: (req.session.errs ? req.session.errs : []),
    title: "Page",
    year: info.years,
    tri: info.trimester,
    full_year: info.full,
    today: req.today,
    connected: connected,
    currentUser: req.session.currentUser,
    loggedIn: (req.session.currentUser ? true : false)
  }

  req.session.info = [];
  req.session.errs = [];
  next();
});

app.use(['/users/:username', '/users/profile', '/advisements/:advisement', '/teachers', '/courses', '/homework'], function(req, res, next) {
  if(req.toJade.loggedIn){
    next();
  }else{
    res.redirect("/login?redir="+req._parsedUrl.pathname);
  }
});

app.use('/*', function(req, res, next) {
  req.toJade.page = req.baseUrl;
  next();
});

app.use('/teachers', function(req, res, next) {
  req.Teacher = mongo.Teacher;
  next();
});

app.use('/courses', function(req, res, next) {
  req.Course = mongo.Course;
  next();
});

app.use('/homework', function(req, res, next) {
  req.HWDay = mongo.HWDay;
  next();
});

app.use('/advisements', function(req, res, next) {
  req.Advisement = mongo.Advisement;
  next();
});



var school_years = require('./modules/years');


// ===========================ROUTES============================
fs.readdirSync("./routes/").forEach(function(path) {
  var name = path.replace('.js');
  app.use('/'+name, require('./routes/'+path));
});

/*
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/advisements', require('./routes/advisements'));
app.use('/teachers', require('./routes/teachers'));
app.use('/courses', require('./routes/courses'));
app.use('/homework', require('./routes/services/homework'));
app.use('/chat', require('./routes/services/chat'));
*/

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
    req.toJade.title = "Oh come on.";
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

var port = normalizePort(process.env.PORT || config.port);
app.set('port', port);
app.set("ipaddr", "");


function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

var messages = [];

var online = [];
var server_user = {name: "Server", username: "fmatranga18", code: 1337};
var codes = [];

// SOCKET.IO
io.sockets.on('connection', function (socket) {
  var client = socket.request.session.currentUser;
  var user = {name: client.firstName, username: client.username, code: client.code};

  socket.emit('pastMessages', {messages: messages});

  console.log("CONNECTED to "+user.username);
  online.push(user);
  console.log(online);
  //socket.emit('message', { user: server_user, message: 'Welcome to the chat, '+user.name+'!', when: moment().toDate() });

  io.sockets.emit('online-list', {users: online});

  socket.on('message', function (data) {
    var d = {user: user, message: data.message, when: data.when};
    messages.push(d);
    io.sockets.emit('message', d);
  });

  socket.on('disconnect', function(socket) {
    console.log("disconnect");
    var index = online.indexOf(user);
    online.splice(index, 1);
    io.sockets.emit('online-list', {users: online});
    console.log(online);
  });
});

http.listen(app.get("port"), app.get("ipaddr"), function() {
  console.log("Server up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});
