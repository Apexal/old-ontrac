var express = require('express');
var router = express.Router();

var players = [];

module.exports = function(io) {

  io.sockets.on('connection', function (socket) {

    socket.on('game-get-playerlist', function(){
      socket.emit('game-playerlist', {players: ['NONE']});
    });


  });

  router.get('/', function(req, res) {
    req.toJade.title = "Game";
    res.render('game', req.toJade);
  });

  return {models: [], router: router};
}
