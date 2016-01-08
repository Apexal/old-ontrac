"use strict";

var mumble = require('mumble');
var fs = require('fs');

var MUMBLE_URL = "mumble://localhost/?version=1.2.0";
if(process.env.NODE_ENV !== 'production')
  MUMBLE_URL = "mumble://www.getontrac.info/?version=1.2.0";

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
