// Core stuff
var express = require("express")
  , app = express()
  , http = require("http").createServer(app)
  , Promise = require("bluebird")
  , bodyParser = require("body-parser")
  , io = require("./server/modules/sockets")(http)
  , compression = require('compression')
  , fs = require("fs")
  , path = require('path')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , bodyParser = require('body-parser')
  , colors = require('colors')
  , session = require('express-session')
  , utils = require('./server/modules/utils')
  , moment = require('moment')
  , config = require('./server/config')
  , mongo = require('./server/modules/mongodb')
  , school_years = require('./server/modules/years')
  , schedules = require("./server/modules/schedule")
  , mumble = require("./server/modules/mumble");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var sessionMiddleware = session({
  secret: 'oh mr savage', // ayy l m a o
  resave: false,
  saveUninitialized: true
});

// Soon
app.use(favicon(__dirname + '/client/public/images/logos/logo32x32.png'));
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});
app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, 'client/public')));
app.locals.basedir = path.join(__dirname, 'views');
app.locals.moment = moment;
app.locals.helpers = utils;

var allowed = ['/', '/home', '/login', '/api/loggedIn'];
app.use(function(req, res, next) {
  console.log(("\nRequest from "+req.connection.remoteAddress).blue.bold +(req.session.currentUser ? " by "+req.session.currentUser.username : "")+" at "+(moment().format("dddd, MMMM Do YYYY, h:mm:ss a")).green.bold);
  req.currentUser = req.session.currentUser;
  req.loggedIn = (req.currentUser != undefined ? true : false);

  req.Log = mongo.Log;

  var info = school_years.getCurrent();
  req.year = info.years;
  req.trimester = info.trimester;
  req.full_year = info.full;

  var now = moment();
  req.today = now.startOf('day');

  // This object is passed to Jade on every request.
  req.toJade = {
    info: (req.session.info ? req.session.info : []),
    errs: (req.session.errs ? req.session.errs : []),
    title: "OnTrac", // default title for a page
    year: info.years,
    tri: info.trimester,
    full_year: info.full,
    todaysInfo: (req.loggedIn ? req.session.todaysInfo : undefined),
    today: req.today,
    production: (process.env.NODE_ENV == 'production'),
    currentUser: req.currentUser,
    loggedIn: req.loggedIn,
    redir: (req.query.redir ? req.query.redir : req._parsedUrl.pathname),
    analytics_code: config.ga_code,
    next: false,
    previous: false,
    nextDay: false,
    previousDay: false,
    page: req.path,
    dailythought: (req.session.dailythought ? req.session.dailythought : ""),
    isHomepage: (req.path == "/" || req.path == "/home" ? true : false)
  }

  if(req.loggedIn){
    req.toJade.nextCD = schedules.getNextDay(moment(), req.currentUser.scheduleObject);
    req.toJade.nextSD = req.currentUser.scheduleObject.scheduleDays[req.toJade.nextCD];

    if(moment(req.currentUser.last_login_time).startOf('day').isSame(moment()) == false){
      var sd = req.currentUser.scheduleObject.scheduleDays[moment().format("MM/DD/YY")];
      if(sd){
        req.session.todaysInfo = {scheduleDay: sd, periods: req.currentUser.scheduleObject.dayClasses[sd]};
      }
    }
  }
  req.toJade.openLogin = (req.toJade.redir == req._parsedUrl.pathname ? false : true);
  console.log(req.toJade.isHomepage);

  req.session.info = [];
  req.session.errs = [];

  if(allowed.indexOf(req.path) == -1 && req.toJade.loggedIn == false){
    res.redirect("/?redir="+req._parsedUrl.pathname);
    console.log("SENDING TO /?redir="+req._parsedUrl.pathname);
    return;
  }

  next();
});

// =================================ROUTES=================================
// This dynamically adds all routes in the routes
// folder and gives them access to whatever Mongo collections they ask for
fs.readdirSync("./server/routes/").forEach(function(path) {
  if(fs.lstatSync("./server/routes/"+path).isDirectory() == false){
    var name = ( path == "index.js" ? '' : path.replace('.js', ''));
    var current = require('./server/routes/'+path)(io);
    app.use('/'+name, function(req, res, next) {
      var models = current.models;
      if(models.length > 0){
        models.forEach(function(m) {
          req[m] = mongo[m];
        });
      }
      next();
    });
    app.use('/'+name, current.router);
    //console.log(("Using ./routes/"+path+" for /"+name).cyan);
  }
});

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
  req.toJade.title = "Uh oh...";
  req.toJade.message = err.message;
  req.toJade.error = "There was an error! Please try again later.";
  res.render('error', req.toJade);
});

app.set('port', normalizePort(process.env.PORT || config.port));
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
