// Core stuff
var express = require("express")
  , app = express()
  , http = require("http").createServer(app)
  , bodyParser = require("body-parser")
  , io = require("./modules/sockets")(http)
  , _ = require("underscore"); // Except this

var fs = require("fs");
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var colors = require('colors');
var session = require('express-session');
var helpers = require('./modules/helpers');
var moment = require('moment');
var config = require('./modules/config');
var mongo = require('./modules/mongodb');
var school_years = require('./modules/years');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var sessionMiddleware = session({
  secret: 'oh mr savage', // ayy l m a o
  resave: false,
  saveUninitialized: true
});

// Soon
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
  console.log(("\nRequest from "+req.connection.remoteAddress).blue.bold +(req.session.currentUser ? " by "+req.session.currentUser.username : "")+" at "+(moment().format("dddd, MMMM Do YYYY, h:mm:ss a")).green.bold);
  req.currentUser = req.session.currentUser;
  req.loggedIn = (req.currentUser != undefined ? true : false);

  req.Log = mongo.Log;

  var info = school_years.getCurrent();
  req.year = info.years;
  req.trimester = info.trimester;
  req.full_year = info.full;

  req.today = moment().startOf('day');

  // This object is passed to Jade every request.
  req.toJade = {
    info: (req.session.info ? req.session.info : []),
    errs: (req.session.errs ? req.session.errs : []),
    title: "Page", // default title for a page
    year: info.years,
    tri: info.trimester,
    full_year: info.full,
    today: req.today,
    currentUser: req.currentUser,
    loggedIn: req.loggedIn
  }

  req.session.info = [];
  req.session.errs = [];
  next();
});

// List of paths users can only access if logged in
var restricted = ['/users/:username', '/users/profile', '/advisements/:advisement', '/teachers', '/courses', '/days', '/chat', '/api', '/game', '/admin'];
app.use(restricted, function(req, res, next) {
  if(req.toJade.loggedIn){
    next();
  }else{
    res.redirect("/login?redir="+req._parsedUrl.pathname);
  }
});

// So Jade knows what nav links to set as active
app.use('/*', function(req, res, next) {
  req.toJade.page = req.baseUrl;
  next();
});

// =================================ROUTES=================================
// This dynamicaly (if that's spelled right) adds all routes in the routes folder
// and gives them access to whatever Mongo collections they need
fs.readdirSync("./routes/").forEach(function(path) {
  if(fs.lstatSync("./routes/"+path).isDirectory() == false){
    var name = ( path == "index.js" ? '' : path.replace('.js', ''));
    app.use('/'+name, function(req, res, next) {
      var models = require('./routes/'+path)(io).models;
      if(models.length > 0){
        models.forEach(function(m) {
          req[m] = mongo[m];
        });
      }
      next();
    });
    app.use('/'+name, require('./routes/'+path)(io).router);
    console.log(("Using ./routes/"+path+" for /"+name).cyan);
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log('404 ERROR'.bold.red);
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
app.set("ipaddr", config.ip);

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

http.listen(app.get("port"), app.get("ipaddr"), function() {
  console.log(("Running on port " + app.get("port")).green.bold);
});
