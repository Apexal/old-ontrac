var express = require('express');
var route = express.Router();

var players = [];

module.exports = function(io) {

  io.sockets.on('connection', function (socket) {

    socket.on('game-get-playerlist', function(){
      socket.emit('game-playerlist', {players: ['NONE']});
    });


  });

  route.get('/', function(req, res) {
    req.toJade.title = "Game";
    res.render('game', req.toJade);
  });

  return route;
}
