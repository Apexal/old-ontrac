var moment = require("moment");
var request = require("request").defaults({jar: true});
var cheerio = require("cheerio");
var Promise = require("bluebird");
var pRequest = require("promisified-request").create(request);

module.exports.login = function(students, username, password) {
  console.log("Attemping login to user '"+username+"' with password '"+password+"'");
  var cookieJar = request.jar();
  students.findOne({username: username}).populate('courses', 'mID title').exec()
    .then(function(student) {
      if(student === null){
        console.log("No such student '"+username+"'");
      }
      return student;
    })
    .then(function(student) {
      return pRequest({
          url: 'https://intranet.regis.org/login/submit.cfm', //URL to hit
          jar: cookieJar,
          method: 'POST',
          form: {
              username: username,
              password: password
          }
      });
    })
    .then(function(res) {
      var body = res.body;
      console.log(body);
      var $ = cheerio.load(body);
      var title = $("title").text();
      if(body.indexOf("http://www.regis.org/login.cfm?Failed=1") > -1){
        console.log("Failed to login as '"+username+"'");
      }else{
        console.log("Successfully logged in as '"+username+"'");
      }
      return student;
    }).then(function(user) {
      console.log("GOOD");
      if(user.registered == false){
        user.loginCount = 0;
        user.last_point_login_time = new Date();
        user.registered_date = new Date();
        user.registered = true;

        return pRequest({
            url: 'http://intranet.regis.org/functions/view_profile.cfm', //URL to hit
            jar: cookieJar,
            method: 'GET'
        });
      }
      user.login_count +=1;
      var fiveMinAgo = moment().subtract(5, 'minutes');
      if(moment(user.last_point_login_time).isBefore(fiveMinAgo)){
        user.points += 10;
        user.last_point_login_time = new Date();
      }
      return user;
    }).then(console.log)
    .catch(Error, function(e) {
      console.log(e);
    });
};
