var l = require("../src/modules/login");
var mongo = require("../src/modules/mongodb");

setTimeout(function() {
  //console.log(mongo);
  l.login(mongo.Student, "fmatranga18", "Takethatmrcroce!");
}, 1000);
