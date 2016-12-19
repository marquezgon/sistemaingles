var Joi = require('joi');
var Boom = require('boom');
var User = require('../models/user.js');
var Bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 12;
exports.login = {
    validate: {
        payload: {
            username : Joi.string().required(),
            password : Joi.string().required(),
        }
    },
    handler: function(request, reply) {
        var payload = request.payload;
        try{
            User.find({username : payload.username }, function(err, user) {//Se ejecuta la busqueda con el parametro de username
                if (!err && user.length > 0) {//en caso de encontrar al usuario comparamos su password con la encriptacion Bcrypt
                     Bcrypt.compare(payload.password , user[0].password, function(err, isMatch) {
                        if(err) {
                                 reply(Boom.badImplementation(err)); // 500 error
                        } else{
                            if(isMatch){// isMatch indica si los passwords son iguales o no 
                                reply(user);
                            } else{
                                reply(Boom.unauthorized('Failed validation'));
                            }
                        }
                    });
                }else{
                   reply(Boom.unauthorized('Failed validation'));
                } 
            });
        }catch(err){
            reply(Boom.badImplementation(err.message));
        }
        
    }
};

exports.getAll = {
    handler: function(request, reply) {
        User.find({}, function(err, user) {// Se ejecuta la busqueda sin parametros ya que se requeren todos los registros
            if (!err) {
                reply(user);//retornamos un arreglo con todos los objetos de la base de datos
                return;
            } 
            reply(Boom.badImplementation(err)); 
        });
    }
};

exports.update = {
     validate: {// se hacen las validaciones necesarias, el password se queda como opcional ya que puede no venir
        payload: {
            name : Joi.string().required(),
            username : Joi.string().required(),
            lastname : Joi.string().required(),
            password : Joi.string().optional(),
        },
        params : {
            id : Joi.string().required(),
        }
    },
    handler: function(request, reply) {
        var payload = request.payload   // recivir parametros por post
        User.findById( request.params.id , function(err, user) {
            if (user) {//si se encuentra el usuario, se setea con sus nuevos valores
                user.name = payload.name;
                user.username = payload.username;
                user.lastname = payload.lastname;
                if(payload.password){//si el password llega, se encripta y se guarda
                    createHashUser(payload.password, user, reply);
                }else{
                     user.save(function(err) {
                        if (!err){
                            reply(user);
                        }else{
                            reply(Boom.unauthorized('Invalid data. ' + err.message));
                        } 
                    });
                }
            }else{
                reply(Boom.notFound('User not found'));
                return;
            } 
        });
    }
};


exports.updatePass = {
    validate: {//como esta funcion solo cambia el password, marcamos como obligatorio el password
        payload: {
            password : Joi.string().required(),
        },
        params : {
            id : Joi.string().required(),
        }
    },
    handler: function(request, reply) {
        var payload = request.payload   // recivir parametros por post
        User.findById( request.params.id , function(err, user) {
            if(!err && user){
                createHashUser(payload.password, user, reply);
            }else{
                reply(Boom.notFound('User not found'));
            }
        });
    }
};

exports.getUser = {
    handler: function(request, reply) {
        var payload = request.params
        User.findById( payload.id , function(err, user) {
            if (!err) {
                reply(user);
                return;
            } 
            reply(Boom.notFound('User not found')); // 404 error
        });
    }
};

exports.create = {
     validate: {
        payload: {
            name : Joi.string().required(),
            username : Joi.string().required(),
            password : Joi.string().required(),
            lastname : Joi.string().required(),
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
                      password: payload.password,
                      status: (payload.status ? payload.status : 1),
                      created :  new Date()
                    });
                    
                    newUser.save(function(err) {
                        if (!err){
                            createHashUser(payload.password, newUser, reply);
                        }else{
                            reply(Boom.unauthorized('Invalid data. ' + err.message));
                        } 
                    });
                }else{
                    reply(Boom.conflict('Duplicated username')); 
                }
                return;
            } 
            reply(Boom.badImplementation(err)); // 500 error
        });
    }
};

function createHashUser(pass, user, reply) {
    Bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if(!err) {
            Bcrypt.hash(pass, salt, function(err, hash) {
                if(err) {
                     user.remove(function(err) {
                        if (err) throw err;
                        reply(Boom.badRequest('Error encrypting password. ')); 
                    });
                    return false;
                }
                user.password = hash;
                user.save(function(err) {
                    if (!err){
                        reply(user);
                        return;
                    }else{
                        user.remove(function(err) {
                            if (err) throw err;
                            reply(Boom.badRequest('Error encrypting password')); 
                            return;
                        });
                    }
                });
                return false;
            });    
        }
        return false;
    });
}

exports.delete = {
    validate: { // Validamos que el tenga el id
        params: {
            id : Joi.string().required()
        }
    },
    handler: function(request, reply) {
        var payload = request.params
        User.findOneAndRemove({ _id : payload.id }, function(err) {//buscamos el registro por su id i depues se eliminda
            if (!err) {
                reply({message : 'User deleted'})
            }else{
                reply(Boom.notFound('User not found'));// en caso de no encotrarlo se regresa el status not found
            } 
        });
    }
};
