var moment = require('moment');
var request = require("request");
var cheerio = require("cheerio");
var Promise = require("bluebird");

var cookieJar = request.jar();

var loginURL = "https://intranet.regis.org/login/submit.cfm";


module.exports.attemptLogin = function(username, password){

  requestp(loginURL, 'POST', false, {username: username, password: password})
    .then(function (data) {
      console.log(data);

      var $ = cheerio.load(data);
      var title = $("title").text();

      if(data.indexOf("url=https://www.regis.org/login.cfm?Failed=1") > -1){
        reject("Incorrect username or password.");
      }else{
        console.log("Successfully logged in as "+username);
        //return requestp()
      }
    }, function (err) {
      console.error(err);
      reject("Failed to reach Regis's servers, please try again later.");
    });
}

console.log(module.exports.attemptLogin("bob", "boop"));

function requestp(url, method, json, form) {
  json = json || false;
  return new Promise(function (resolve, reject) {
    var passing = {url:url, json:json, jar: cookieJar, method: method};
    if(form !== false){passing.form = form};
    request(passing, function (err, res, body) {
      if (err) {
        return reject(err);
      } else if (res.statusCode !== 200) {
        err = new Error("Unexpected status code: " + res.statusCode);
        err.res = res;
        return reject(err);
      }
      resolve(body);
    });
  });
}
