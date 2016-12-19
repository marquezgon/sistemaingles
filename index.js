'use strict';
const Hapi = require('hapi');
var Mongoose = require('mongoose');
var Bcrypt = require('bcrypt');
var User = require('./models/user.js');
var routes = require('./routes');
var SALT_WORK_FACTOR = 12;
const secret = 'm3x3rp';

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


var validate = function (token, request, callback) {
        console.log('entro');

    jwt.verify(token, secret, function (err, decoded) {
      if (err) {
        return callback(err)
      }
      var credentials = request.auth.credentials;
      // .. do some additional credentials checking
      return callback(null, true, decoded);
    });
};


server.register(require('hapi-auth-jwt'), function (error) {
    server.auth.strategy('jwt', 'jwt', {
        key: secret,
        validateFunc: validate
    });

    server.route(routes);
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
