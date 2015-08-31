var nodemailer = require("nodemailer");
var secrets = require("../secrets.json");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: secrets.gmail_username,
        pass: secrets.gmail_password
    }
});

module.exports = function(to, title, message){
  var mailOptions = {
      from: "OnTrac <"+secrets.gmail_username+">", // sender address
      to: to, // list of receivers
      subject: title, // Subject line
      text: message, // plaintext body
      html: message // html body
  }
  smtpTransport.sendMail(mailOptions, function(error, info){
      if(error){
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);
  });
}
