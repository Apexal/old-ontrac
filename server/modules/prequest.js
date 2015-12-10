var request = require("request-promise");
var cookieJar = request.jar(); // For the session
var username = "fmatranga18";
var password = "Ohmrsasvage!";
request({
  url: 'https://intranet.regis.org/login/submit.cfm', //URL that the login form on the Intranet points to
  jar: cookieJar,
  method: 'POST',
  //Lets post the following key/values as form
  form: {
    username: username,
    password: password
  },
  transform: function (body) {
    return cheerio.load(body);
  }
})
.then(function (htmlString) {
  console.log(htmlString);
})
.catch(function (err) {
  console.error(err.message);
});
/*var Promise = require("promise");

function prequest(options){
  return new Promise(function (resolve, reject) {
    request(options, function (err, res, body) {
      if (err) {
        console.log(err);
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

module.exports = prequest;



prequest().then(function(data){
  console.log(data.substring(0, 100));
}, function(err){
  console.error("%s; %s", err.message, url);
  console.log("%j", err.res.statusCode);
});
*/
