var Joi = require('joi');
var Boom = require('boom');
var User = require('../models/user.js');
var Bcrypt = require('bcrypt');

exports.login = {
    handler: function(request, reply) {
        var payload = request.payload;
        try{
            User.find({username : payload.username }, function(err, user) {
                if (!err && user.length > 0) {
                     Bcrypt.compare(payload.password , user[0].password, function(err, isMatch) {
                        console.log(isMatch);
                        if(err) {
                                 reply(Boom.badImplementation(err)); // 500 error
                        }else{
                            if(isMatch){
                                reply(user);
                            }else{
                                reply(Boom.forbidden('Failed validation'));
                            }
                        }
                    });
                }else{
                   reply(Boom.forbidden('Failed validation'));
                } 
            });
        }catch(err){
            reply(Boom.forbidden('Failed validation'));
        }
        
    }
};

exports.getAll = {
    handler: function(request, reply) {
        var payload = request.payload   // recivir parametros por post
        User.find({}, function(err, user) {
            if (!err) {
                reply(user);
                return;
            } 
            reply(Boom.badImplementation(err)); // 500 error
        });
    }
};

exports.getUser = {
    handler: function(request, reply) {
        var payload = request.query
        reply(payload); 
        // User.find({}, function(err, user) {
        //     if (!err) {
        //         reply(user);
        //         return;
        //     } 
        //     reply(Boom.badImplementation(err)); // 500 error
        // });
    }
};


exports.saveUser = {
    handler: function(request, reply) {
        console.log('Entro');
        var payload = request.payload   // recivir parametros por post
        var newUser = User({
          name: payload.name,
          lastname: payload.lastname,
          username: payload.username,
          status: (payload.status ? payload.status : 1),
          created :  new Date()
        });
        // save the user
        newUser.save(function(err) {
            if (err) throw err;
            createHashUser(payload.password, newUser);
        });

    }
};

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