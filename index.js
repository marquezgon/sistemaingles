'use strict';
const Hapi = require('hapi');
var Mongoose = require('mongoose');
var Bcrypt = require('bcrypt');
var User = require('./models/user.js');
var routes = require('./routes');
var SALT_WORK_FACTOR = 12;

//CONNECTION DATA BASE
var mongodbUri = 'mongodb://'+process.env.DBUSER+':'+process.env.DBPASS+'@'+process.env.DBHOST+':'+process.env.DBPORT+'/'+process.env.DBNAME;
Mongoose.connect(mongodbUri);

var db = Mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
   console.log("Connection with database succeeded.");
});

// Create a server with a host and port
const server = new Hapi.Server();

server.connection({
    host: process.env.NODE_HOST,
    port: process.env.NODE_PORT
});

server.register(
  [{
    register: require('hapi-auth-jwt')
  }, {
    register: require('./plugins/auth.js')
  }, {
    register: require('./routes/user.js')
  }], (err) => {
    if (err) {
        throw err;
    }

    // Start the server
    server.start((err) => {

        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });
});
