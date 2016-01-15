var moment = require("moment");
var filter = require("./utils").filter;
var fs = require('fs');

messages = [];
online = [];
usernames = [];

spammers = [];

var timeoutSeconds = 30;

var advchatmessages = {};

module.exports = function(http) {
  var io = require("socket.io").listen(http);

  var spamWait = function(username){
    setTimeout(function() {
      spammers.splice(spammers.indexOf(username), 1);
    }, 10000);
  }

  var detectLogout = function(username){
    setTimeout(function(){
      //console.log("CHECKING FOR LOGOUT...");
      var index = usernames.indexOf(username);
      if(index > -1){
        if(online[index].tabs <= 0){
          online.splice(index, 1);
          usernames.splice(index, 1);
          console.log((username+" LOGGED OUT!").red);
          io.sockets.emit('online-list', {users: online});
          var d = {username: "server", message: username+" is now offline.", when: Date.now(), ignore: username};
          messages.push(d);
          io.sockets.emit('message', d);
        }else{
          //console.log("He didn't log out!");
        }
      }
    }, 1000 * timeoutSeconds);
  }

  io.sockets.on('connection', function (socket) {
    messages = messages.slice(-100);

    var client = socket.request.session.currentUser;

    try {
      var user = {username: client.username, tabs: 1, advisement: client.advisement};
      //var user = {name: client.firstName, username: client.username, code: client.code, tabs: 1};
      socket.emit('pastMessages', {messages: messages});
      var status = "available";

      //console.log(codes.indexOf(user.code));
      if(usernames.indexOf(user.username) > -1){
        console.log("New tab from "+user.username + " with status "+online[usernames.indexOf(user.username)].status);
        online[usernames.indexOf(user.username)].tabs += 1;
      }else{
        usernames.push(user.username);
        online.push(user);
        var d = {username: "server", message: user.username+" is now online.", when: Date.now(), ignore: user.username};
        messages.push(d);
        io.sockets.emit('message', d);
      }

      //console.log(codes);
      //console.log(online);
      io.sockets.emit('online-list', {users: online});

      socket.on('user-login', function(data) {
        var d = {username: "server", message: user.username+" has logged in.", when: Date.now()};
        messages.push(d);
        io.sockets.emit('message', d);
      });

      socket.on('message', function (data) {
        if(client.rank >= 6 && data.message.indexOf("/bc ") > -1){
          io.sockets.emit('broadcast', {message: data.message.split("/bc ")[1]});
          return;
        }
        if(client.rank >= 7 && data.message == "/clear"){
          messages = [];
          var d = {username: "server", message: "An admin has cleared the chat.", when: data.when};
          messages.push(d);
          socket.emit('pastMessages', {messages: messages});
          return;
        }
        var minimum = moment().subtract(5, 'seconds');
        var recentUserMessages = messages.filter(function(m) {
          return (m.username == user.username && moment(m.when).isAfter(minimum));
        });
        for(var i=0;i<recentUserMessages.length;i++){
          if(i-1 >= 0){
            var last = recentUserMessages[i-1];
            if(last.message.length > 20 && recentUserMessages[i].message.length > 20){
              if(spammers.indexOf(user.username) == -1){
                spammers.push(user.username);
                socket.emit('message', {username: "server", message: "Muted for 10 seconds due to spamming.", when: Date.now()});
                spamWait(user.username);
              }
              return;
            }
          }
        }
        if(recentUserMessages.length > 6 || spammers.indexOf(user.username) > -1){
          if(spammers.indexOf(user.username) == -1){
            spammers.push(user.username);
            socket.emit('message', {username: "server", message: "Muted for 10 seconds due to spamming.", when: Date.now()});
            spamWait(user.username);
          }
        }else{
          var d = {username: user.username, message: filter(data.message), when: data.when};
          messages.push(d);
          io.sockets.emit('message', d);
        }
      });

      socket.on('setstatus', function (data) {
        var index = usernames.indexOf(user.username);
        if(index > -1){
          online[index].status = (data.status !== undefined ? data.status : "available");
        }else{
          console.log("Couldn't find");
        }
        //console.log(online);
        io.sockets.emit('online-list', {users: online});
      });


      /* ADVISEMENT CHAT */

      socket.on('join-advchat', function(data) {
        socket.join(client.advisement);
        if(!advchatmessages[client.advisement]){
          advchatmessages[client.advisement] = [];
        }
        //console.log(client.username + " entered the private chatroom for "+client.advisement);
        socket.emit('advchat-pastmessages', {messages: advchatmessages[client.advisement]})
      });

      socket.on('advchat-message', function(data) {
        var d = {username: user.username, message: filter(data.message), when: data.when};
        advchatmessages[client.advisement].push(d);
        advchatmessages[client.advisement] = advchatmessages[client.advisement].slice(-100);
        io.to(client.advisement).emit('advchat-message', d);
      });
      /*-----------------*/

      socket.on('disconnect', function(socket) {
        var index = usernames.indexOf(user.username);
        if(index == -1) return "FAILED";
        online[index].tabs -= 1;

        if(online[index].tabs <= 0){
          detectLogout(user.username);
        }else{
          io.sockets.emit('online-list', {users: online});
        }
      });
    }catch(err) {
      socket.emit('refresh');
    }
  });

  return io;
};
