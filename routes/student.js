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

    server.route({
        method: 'GET',
        path: '/student',
        config: {
          // auth : {
          //   strategy: 'jwt',
          //   mode: 'required'
          // }
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


    return next();
};

exports.register.attributes = {
    name: 'routes-student'
};
