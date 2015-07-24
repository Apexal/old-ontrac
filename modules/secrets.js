var crypto = require("crypto");
// plz no steal my psswds plz
var passwords = module.exports =  {
    gmail: decrypt("d2c67a9c1bf07ad2c9375fd77fcfddf4e132c28fb0c6ffbd0846d9714a74f177"),
    regis: decrypt("7d47ba745c6d2bbb64f7bd14e6d503830c2b5eb91bcdea88c28557fc4932b407")
};

// TODO: Remove this function
function encrypt(text){
  var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq')
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}