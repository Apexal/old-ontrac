var moment = require("moment");
var messages = [];
var online = [];
var server_user = {username: "OnTrac", tabs: 1};
var usernames = [];

module.exports = function(http) {
  var io = require("socket.io").listen(http);

  io.sockets.on('connection', function (socket) {
    messages = messages.slice(Math.max(messages.length - 100, 0))
    var client = socket.request.session.currentUser;

    try {
      var user = {username: client.username, tabs: 1};
      //var user = {name: client.firstName, username: client.username, code: client.code, tabs: 1};
      socket.emit('pastMessages', {messages: messages});
      var status = "online";

      //console.log(codes.indexOf(user.code));
      if(usernames.indexOf(user.username) > -1){
        console.log("New tab from "+user.username + " with status "+online[usernames.indexOf(user.username)].status);
        online[usernames.indexOf(user.username)].tabs += 1;
      }else{
        usernames.push(user.username);
        online.push(user);
        console.log("New connection from "+user.username);
      }

      //console.log(codes);
      //console.log(online);
      io.sockets.emit('online-list', {users: online});

      socket.on('message', function (data) {
        var d = {username: user.username, message: data.message, when: data.when};
        messages.push(d);
        io.sockets.emit('message', d);
      });

      socket.on('setstatus', function (data) {
        var index = usernames.indexOf(user.username);
        if(usernames.indexOf(user.username) > -1){
          online[index].status = data.status;
          //console.log("Found!");
        }else{
          console.log("Couldn't find");
        }
        //console.log(online);
        io.sockets.emit('online-list', {users: online});
      });

      socket.on('disconnect', function(socket) {
        console.log("DISCONNECT from "+user.username);
        var index = usernames.indexOf(user.username);
        //console.log(index);
        if(index == -1) throw "FAILED";
        online[index].tabs -= 1;

        if(online[index].tabs <= 0){
          online.splice(index, 1);
          usernames.splice(index, 1);
        }

        //console.log(codes);
        //console.log(online);
        io.sockets.emit('online-list', {users: online});
      });
    }catch(err) {
      socket.emit('refresh');
    }
  });

  return io;
};
