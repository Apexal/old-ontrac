"use strict";

var mumble = require('mumble');
var fs = require('fs');

var MUMBLE_URL = "mumble://localhost/?version=1.2.0";

var options = {
  //key: fs.readFileSync( 'private.pem' ),
  //cert: fs.readFileSync( 'public.pem' )
}
var sessions = {};
var channels = {};

console.log( 'Connecting' );

module.exports = function(callback){
  mumble.connect( MUMBLE_URL, options, callback);
}

function test( error, connection ) {
  if( error ) { throw new Error( error ); }

  connection.authenticate( 'ontrac-bot', 'regis' );

  connection.on( 'initialized', function () {
    console.log('connection ready');
  });

  // Show all incoming events and the name of the event which is fired.
  connection.on( 'protocol-in', function (data) {
    //console.log('event', data.handler, 'data', data.message);
  });

  // Collect user information

  connection.on( 'userState', function (state) {
    sessions[state.session] = state;
  });

  // Collect channel information
  connection.on( 'channelState', function (state) {
    channels[state.channelId] = state;
  });

  connection.on('user-disconnect', function(user) {
    console.log("User " + user.name + " disconnected from Mumble");
  });
  connection.on('user-connect', function(user) {
    console.log("User " + user.name + " connected to Mumble");
  });

  // On text message...
  connection.on( 'textMessage', function (data) {
    var user = sessions[data.actor];
    //console.log(user.name + ':', data.message);
  });

  connection.on( 'voice', function (event) {
    //console.log( 'Mixed voice' );
    var pcmData = event.data;
  });
}
