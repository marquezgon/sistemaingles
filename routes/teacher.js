'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Teacher = require('../models/teacher.js');
const jwt = require('jsonwebtoken');
const Bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 12;

function createHash(teacher, reply) {
    Bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if(!err) {
            Bcrypt.hash(teacher.password, salt, function(err, hash) {
              if(err) throw err;
              teacher.password = hash;
              teacher.save(function(err) {
                if (!err) {
                  return reply(teacher).code(201);
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
    //fetch all teachers
    server.route({
        method: 'POST',
        path: '/teacher',
        config: {
         validate: {
            payload: {
               name : Joi.string().required(),
               username : Joi.string().required(),
               password : Joi.string().required(),
               lastname : Joi.string().required(),
           }
         }
        },
        handler: function(request, reply) {
        	var payload = request.payload   // recivir parametros por post
           Teacher.find({ username : payload.username }, function(err, teacher) {
               if (!err) {
                   if(teacher.length == 0 ){
                       var newTeacher = Teacher({
                         name: payload.name,
                         lastname: payload.lastname,
                         username: payload.username,
                         password: payload.password,
                         scope : 'teacher',
                         status: (payload.status ? payload.status : 1),
                         created :  new Date()
                       });
                       return createHash(newTeacher, reply);
                   } else {
                       return reply(Boom.conflict('Duplicated username'));
                   }
               }
               return reply(Boom.badImplementation(err)); // 500 error
           });
        }
    });

    server.route({
        method: 'GET',
        path: '/teacher',
        config: {
          auth : {
            strategy: 'jwt',
            mode: 'required'
          }
        },
        handler: function(request, reply) {
            Teacher.find({}, function(err, teacher) {// Se ejecuta la busqueda sin parametros ya que se requieren todos los registros
                if (!err) {
                    return reply(teacher);//retornamos un arreglo con todos los objetos de la base de datos
                }
                return reply(Boom.badImplementation(err));
            });
        }
    });

    //delete given teacher
    server.route({
        method: 'DELETE',
        path: '/teacher/{id}',
        config: {
            validate: { // Validamos que el tenga el id
            params: {
                id : Joi.string().required()
            }
          }
        },
        handler: function(request, reply) {
            Teacher.findOneAndRemove({ _id : request.params.id }, function(err) {//buscamos el registro por su id i depues se eliminda
                if (!err) {
                  return reply({message : 'Teacher deleted'})
                }else{
                  return reply(Boom.notFound('Teacher not found'));// en caso de no encotrarlo se regresa el status not found
                }
            });
        }
    });

    //update teacher record
    server.route({
        method: 'PUT',
        path: '/teacher/{id}',
        config: {
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
          }
        },
       handler: function(request, reply) {
           var payload = request.payload   // recivir parametros por post
           Teacher.findById( request.params.id , function(err, teacher) {
               if (teacher) {//si se encuentra el teacher, se setea con sus nuevos valores
                   teacher.name = payload.name;
                   teacher.username = payload.username;
                   teacher.lastname = payload.lastname;
                   teacher.scope = 'teacher';
                   if(payload.password){//si el password llega, se encripta y se guarda
                     teacher.password = payload.password;
                     createHash(teacher, reply);
                   } else {
                        teacher.save(function(err) {
                           if (!err){
                               return reply(teacher);
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

    return next();
};

exports.register.attributes = {
    name: 'routes-teacher'
};
