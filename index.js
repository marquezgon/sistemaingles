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

function createHashUser(pass,user) {
    Bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if(err) {
                return console.error(err);
        }

        Bcrypt.hash(pass, salt, function(err, hash) {
                if(err) {
                        return console.error(err);
                }
            user.password = hash;
            user.save(function(err) {
                if (err) throw err;

                console.log('User successfully updated!');
            });

            console.log(hash);
        });
    });
}

User.findById('585084eeb6e9eb4c9ecd3a28', function(err, user) {
  if (err) throw err;
    createHashUser('123456', user);      
});




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
//server.auth.strategy('simple', 'basic', { validateFunc: validate });
server.route(routes);



// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
