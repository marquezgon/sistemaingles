'use strict';
const Hapi = require('hapi');
var Mongoose = require('mongoose');
var User = require('./models/user.js');

//CONNECTION DATA BASE
var mongodbUri = 'mongodb://'+process.env.DBUSER+':'+process.env.DBPASS+'@'+process.env.DBHOST+':'+process.env.DBPORT+'/'+process.env.DBNAME;
Mongoose.connect(mongodbUri);

var db = Mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
   console.log("Connection with database succeeded.");
});


// var newUser = User({
//   name: 'Jesus',
//   lastname: 'Mendoza',
//   username: 'mexERP',
//   password: 'password',
//   status: 1,
//   created :  new Date()
// });

// // save the user
// newUser.save(function(err) {
//   if (err) throw err;

//   console.log('User created!');
// });



// User.findById('585084eeb6e9eb4c9ecd3a28', function(err, user) {
//   if (err) throw err;

//   // change the users location
//   user.name = 'new name';

//   // save the user
//   user.save(function(err) {
//     if (err) throw err;

//     console.log('User successfully updated!');
//   });

// });



User.find({}, function(err, users) {
  if (err) throw err;

  // object of all the users
  console.log(users);
});

// Create a server with a host and port
const server = new Hapi.Server();

server.connection({
    host: process.env.NODE_HOST,
    port: process.env.NODE_PORT
});

// Add the route
server.route({
    method: 'GET',
    path:'/hello',
    handler: function (request, reply) {

        return reply('hello world');
    }
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
