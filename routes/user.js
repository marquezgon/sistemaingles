'use strict';

const Joi = require('joi');
const Boom = require('boom');
const User = require('../models/user.js');
const Bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 12;
const jwt = require('jsonwebtoken');

function createToken(user) {
  try {
    let userObj = user[0];
    // Sign the JWT
    return jwt.sign({ username: userObj.username, id: userObj._id }, 'm3x3rp', { algorithm: 'HS256', expiresIn: "1h" } );
  } catch (err) {
    throw err;
  }
}

function createHashUser(user, reply) {
    Bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if(!err) {
            Bcrypt.hash(user.password, salt, function(err, hash) {
              if(err) throw err;
              user.password = hash;
              user.save(function(err) {
                if (!err) {
                  return reply(user);
                } else {
                  throw err;
                }
              });
            });
        } else {
          throw err;
        }
    });
}

exports.register = function (server, options, next) {

    //login user
    server.route({
        method: 'POST',
        path: '/users/login',
        config: {
            validate: {
            payload: {
                username : Joi.string().required(),
                password : Joi.string().required(),
            }
          }
        },
        handler: function(request, reply) {
            var payload = request.payload;
            try{
                User.find({username : payload.username }, function(err, user) {//Se ejecuta la busqueda con el parametro de username
                    if (err) throw err;
                    if (user.length > 0) {//en caso de encontrar al usuario comparamos su password con la encriptacion Bcrypt
                         Bcrypt.compare(payload.password , user[0].password, function(err, isMatch) {
                            if(err) {
                                     return reply(Boom.badImplementation(err)); // 500 error
                            } else{
                                if(isMatch){// isMatch indica si los passwords son iguales o no
                                    return reply({ token: createToken(user) }).code(201);
                                } else{
                                    return reply(Boom.unauthorized('Incorrect username or password'));
                                }
                            }
                        });
                    } else {
                       return reply(Boom.unauthorized('Failed validation'));
                    }
                });
            }catch(err){
                return reply(Boom.badImplementation(err.message));
            }

        }
    });

    //fetch all users
    server.route({
        method: 'GET',
        path: '/users',
        config: {
          auth : {
            strategy: 'jwt',
            mode: 'required'
          }
        },
        handler: function(request, reply) {
            User.find({}, function(err, user) {// Se ejecuta la busqueda sin parametros ya que se requieren todos los registros
                if (!err) {
                    return reply(user);//retornamos un arreglo con todos los objetos de la base de datos
                }
                return reply(Boom.badImplementation(err));
            });
        }
    });

    //update user record
    server.route({
        method: 'PUT',
        path: '/users/{id}',
        config: {
          validate: {// se hacen las validaciones necesarias, el password se queda como opcional ya que puede no venir
             payload: {
                 name : Joi.string().required(),
                 username : Joi.string().required(),
                 scope : Joi.string().required(),
                 lastname : Joi.string().required(),
                 password : Joi.string().optional(),
             },
             params : {
                 id : Joi.string().required(),
             }
          }
        },
       handler: function(request, reply) {
           var payload = request.payload   // recivir parametros por post
           User.findById( request.params.id , function(err, user) {
               if (user) {//si se encuentra el usuario, se setea con sus nuevos valores
                   user.name = payload.name;
                   user.username = payload.username;
                   user.scope = payload.scope;
                   user.lastname = payload.lastname;
                   if(payload.password){//si el password llega, se encripta y se guarda
                     user.password = payload.password;
                     createHashUser(user, reply);
                   } else {
                        user.save(function(err) {
                           if (!err){
                               return reply(user);
                           }else{
                               return reply(Boom.unauthorized('Invalid data. ' + err.message));
                           }
                       });
                   }
               }else{
                   return reply(Boom.notFound('User not found'));
               }
           });
       }
    });

    //update user password
    server.route({
        method: 'PATCH',
        path: '/users/{id}',
        config: {
            validate: {//como esta funcion solo cambia el password, marcamos como obligatorio el password
            payload: {
                password : Joi.string().required(),
            },
            params : {
                id : Joi.string().required(),
            }
          }
        },
        handler: function(request, reply) {
            var payload = request.payload   // recivir parametros por post
            User.findById( request.params.id , function(err, user) {
                if(err) throw err;
                if(user){
                    user.password = payload.password
                    createHashUser(user, reply);
                } else {
                    return reply(Boom.notFound('User not found'));
                }
            });
        }
    });

    //fetch record of a given user
    server.route({
        method: 'GET',
        path: '/users/{id}',
        handler: function(request, reply) {
            var payload = request.params
            User.findById( payload.id , function(err, user) {
                if (!err) {
                    return reply(user);
                }
                return reply(Boom.notFound('User not found')); // 404 error
            });
        }
    });

    //delete given user
    server.route({
        method: 'DELETE',
        path: '/users/{id}',
        config: {
            validate: { // Validamos que el tenga el id
            params: {
                id : Joi.string().required()
            }
          }
        },
        handler: function(request, reply) {
            var payload = request.params
            User.findOneAndRemove({ _id : payload.id }, function(err) {//buscamos el registro por su id i depues se eliminda
                if (!err) {
                  return reply({message : 'User deleted'})
                }else{
                  return reply(Boom.notFound('User not found'));// en caso de no encotrarlo se regresa el status not found
                }
            });
        }
    });

    //create new user
    server.route({
        method: 'POST',
        path: '/users',
        config: {
          validate: {
            payload: {
               name : Joi.string().required(),
               username : Joi.string().required(),
               password : Joi.string().required(),
               scope : Joi.string().required(),
               lastname : Joi.string().required(),
           }
         }
       },
       handler: function(request, reply) {
           var payload = request.payload   // recivir parametros por post
           User.find({ username : payload.username }, function(err, user) {
               if (!err) {
                   if(user.length == 0 ){
                       var newUser = User({
                         name: payload.name,
                         lastname: payload.lastname,
                         username: payload.username,
                         scope: payload.scope,
                         password: payload.password,
                         status: (payload.status ? payload.status : 1),
                         created :  new Date()
                       });
                       return createHashUser(newUser, reply);

                   } else {
                       return reply(Boom.conflict('Duplicated username'));
                   }
               }
               return reply(Boom.badImplementation(err)); // 500 error
           });
       }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes-users'
};
