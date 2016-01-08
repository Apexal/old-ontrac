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
      connection.authenticate( 'ontrac-bot2', 'regis' );

    connection.on( 'userState', function (state) {
      sessions[state.session] = state;
      online = [];
      for (var key in sessions) {
        if (sessions.hasOwnProperty(key)) {
          if(sessions[key].name !== undefined){
            if(sessions[key].name.indexOf("ontrac") == -1)
              online.push( sessions[key].name );
          }
        }
      }
    });

    router.get('/online', function(req, res) {
      res.json(online);
    });

  });
  return {router: router, models: []}
};
