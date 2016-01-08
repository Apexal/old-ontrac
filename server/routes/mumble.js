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

    });

    router.get('/online', function(req, res) {
      res.json(online);
    });

  });
  return {router: router, models: []}
};
