var sessions = {};
var channels = {};

var online = [];

var express = require('express');
var router = express.Router();

var mumble = require("../modules/mumble");

module.exports = function(io) {
  mumble(function(error, connection) {
    if( error ) { throw new Error( error ); }

    if(process.env.NODE_ENV == 'production')
      connection.authenticate( 'ontrac-bot', 'regis' );

    connection.on( 'userState', function (state) {
      if(state !== null && state.name !== null){
        if(online.indexOf(state.name) == -1 && state.name.indexOf("ontrac-bot") == -1)
          online.push(state.name);
      }
    });

    connection.on('user-disconnect', function(user) {
      if(online.indexOf(user.name) > -1)
        online.splice(online.indexOf(user.name), 1);
    });

    router.get('/online', function(req, res) {
      res.json(online);
    });

  });
  return {router: router, models: []}
};
