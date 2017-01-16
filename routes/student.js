'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Student = require('../models/student.js');
const jwt = require('jsonwebtoken');
const Bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 12;

function createHash(student, reply) {
    Bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if(!err) {
            Bcrypt.hash(student.password, salt, function(err, hash) {
              if(err) throw err;
              student.password = hash;
              student.save(function(err) {
                if (!err) {
                  return reply(student);
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
    //fetch all students
    server.route({
        method: 'POST',
        path: '/student',
        config: {
          validate: {
            payload: {
               name : Joi.string().required(),
               username : Joi.string().required(),
               password : Joi.string().required(),
               lastname : Joi.string().required(),
            }
          }, 
          auth : {
            scope : ['admin', 'student'],
            strategy: 'jwt',
            mode: 'required'
          }
        },
        handler: function(request, reply) {
        	var payload = request.payload   // recivir parametros por post
           Student.find({ username : payload.username }, function(err, student) {
               if (!err) {
                   if(student.length == 0 ){
                       var newStudent = Student({
                         name: payload.name,
                         lastname: payload.lastname,
                         username: payload.username,
                         scope : 'student',
                         password: payload.password,
                         status: (payload.status ? payload.status : 1),
                         created :  new Date()
                       });
                       return createHash(newStudent, reply);

                   } else {
                       return reply(Boom.conflict('Duplicated username'));
                   }
               }
               return reply(Boom.badImplementation(err)); // 500 error
           });
        }
    });

        //update user record
    server.route({
        method: 'PUT',
        path: '/student/{id}',
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
          },
          auth : {
            scope : ['admin', 'student'],
            strategy: 'jwt',
            mode: 'required'
          }
        },
       handler: function(request, reply) {
           var payload = request.payload   // recivir parametros por post
           Student.findById( request.params.id , function(err, student) {
               if (student) {//si se encuentra el usuario, se setea con sus nuevos valores
                   student.name = payload.name;
                   student.username = payload.username;
                   student.lastname = payload.lastname;
                   student.scope = 'student';
                   if(payload.password){//si el password llega, se encripta y se guarda
                     student.password = payload.password;
                     createHash(student, reply);
                   } else {
                        student.save(function(err) {
                           if (!err){
                               return reply(student);
                           }else{
                               return reply(Boom.unauthorized('Invalid data. ' + err.message));
                           }
                       });
                   }
               }else{
                   return reply(Boom.notFound('student not found'));
               }
           });
       }
    });

    server.route({
        method: 'GET',
        path: '/student',
        config: {
          auth : {
            scope : ['admin', 'student'],
            strategy: 'jwt',
            mode: 'required'
          }
        },
        handler: function(request, reply) {
            Student.find({}, function(err, student) {// Se ejecuta la busqueda sin parametros ya que se requieren todos los registros
                if (!err) {
                    return reply(student);//retornamos un arreglo con todos los objetos de la base de datos
                }
                return reply(Boom.badImplementation(err));
            });
        }
    });


    //delete given teacher
    server.route({
        method: 'DELETE',
        path: '/student/{id}',
        config: {
            validate: { // Validamos que el tenga el id
              params: {
                  id : Joi.string().required()
              }
            }, 
            auth : {
              scope : ['admin', 'student'],
              strategy: 'jwt',
              mode: 'required'
            }
        },
        handler: function(request, reply) {
            Student.findOneAndRemove({ _id : request.params.id }, function(err) {//buscamos el registro por su id i depues se eliminda
                if (!err) {
                  return reply({message : 'Student deleted'})
                }else{
                  return reply(Boom.notFound('Student not found'));// en caso de no encotrarlo se regresa el status not found
                }
            });
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes-student'
};
