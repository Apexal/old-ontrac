var messages = [];
var online = [];
var server_user = {name: "Server", username: "fmatranga18", code: 1337};

module.exports = function(http) {
  var io = require("socket.io").listen(http);

  io.sockets.on('connection', function (socket) {
    messages = messages.slice(Math.max(messages.length - 100, 0))
    var client = socket.request.session.currentUser;
    var user = {name: client.firstName, username: client.username, code: client.code};

    socket.emit('pastMessages', {messages: messages});

    console.log("CONNECTED to "+user.username);
    online.push(user);
    console.log(online);
    //socket.emit('message', { user: server_user, message: 'Welcome to the chat, '+user.name+'!', when: moment().toDate() });

    io.sockets.emit('online-list', {users: online});

    socket.on('message', function (data) {
      var d = {user: user, message: data.message, when: data.when};
      messages.push(d);
      io.sockets.emit('message', d);
    });

    socket.on('disconnect', function(socket) {
      console.log("disconnect");
      var index = online.indexOf(user);
      online.splice(index, 1);
      io.sockets.emit('online-list', {users: online});
      console.log(online);
    });
  });

  return io;
};
