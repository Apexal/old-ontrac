var moment = require("moment");
var messages = [];
var online = [];
var server_user = {name: "Server", username: "fmatranga18", code: 1337};
var codes = [];

module.exports = function(http) {
  var io = require("socket.io").listen(http);

  io.sockets.on('connection', function (socket) {
    messages = messages.slice(Math.max(messages.length - 100, 0))
    var client = socket.request.session.currentUser;

    try {
      var user = {name: client.firstName, username: client.username, code: client.code, tabs: 1};
      
  
      socket.emit('pastMessages', {messages: messages});
  
      console.log(codes.indexOf(user.code));
  
      if(codes.indexOf(user.code) > -1){
        console.log("New tab from "+user.username);
        online[codes.indexOf(user.code)].tabs += 1;
      }else{
        codes.push(user.code);
        online.push(user);
        console.log("New connection from "+user.username);
      }
      console.log(codes);
      console.log(online);
  
      io.sockets.emit('online-list', {users: online});
  
      socket.on('message', function (data) {
        var d = {user: user, message: data.message, when: data.when};
        messages.push(d);
        io.sockets.emit('message', d);
      });
  
      socket.on('disconnect', function(socket) {
        console.log("DISCONNECT from "+user.username);
        var index = codes.indexOf(user.code);
        console.log(index);
        if(index == -1) throw "FAILED";
        online[index].tabs -= 1;
  
        if(online[index].tabs <= 0){
          online.splice(index, 1);
          codes.splice(index, 1);
        }
  
        console.log(codes);
        console.log(online);
        io.sockets.emit('online-list', {users: online});
      });
    }catch(err) {
      socket.emit('refresh');
    }
  });

  return io;
};
