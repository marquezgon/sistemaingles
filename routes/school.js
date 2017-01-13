'use strict';

const Joi = require('joi');
const Boom = require('boom');
const School = require('../models/school.js');
const jwt = require('jsonwebtoken');
const Bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 12;

exports.register = function (server, options, next) {
    //fetch all schools
    server.route({
        method: 'POST',
        path: '/school',
        config: {
         validate: {
            payload: {
               name : Joi.string().required(),
           }
         }
        },
        handler: function(request, reply) {
        	var payload = request.payload   // recivir parametros por post
           School.find({ name : payload.name }, function(err, school) {
               if (!err) {
                   if(school.length == 0 ){
                       var newschool = School({
                         name: payload.name,
                         status: (payload.status ? payload.status : 1),
                         created :  new Date()
                       });
                       newschool.save(function(err) {
                       if (!err){
                           return reply(newschool).code(201);
                       }else{
                           return reply(Boom.unauthorized('Invalid data. ' + err.message));
                       }
                   });
                   } else {
                       return reply(Boom.conflict('Duplicated username'));
                   }
               }else{
               		return reply(Boom.badImplementation(err)); // 500 error
               }
           });
        }
    });

    server.route({
        method: 'GET',
        path: '/school',
        config: {
          // auth : {
          //   strategy: 'jwt',
          //   mode: 'required'
          // }
        },
        handler: function(request, reply) {
            School.find({}, function(err, school) {// Se ejecuta la busqueda sin parametros ya que se requieren todos los registros
                if (!err) {
                    return reply(school);//retornamos un arreglo con todos los objetos de la base de datos
                }
                return reply(Boom.badImplementation(err));
            });
        }
    });

    //delete given school
    server.route({
        method: 'DELETE',
        path: '/school/{id}',
        config: {
            validate: { // Validamos que el tenga el id
            params: {
                id : Joi.string().required()
            }
          }
        },
        handler: function(request, reply) {
            School.findOneAndRemove({ _id : request.params.id }, function(err) {//buscamos el registro por su id i depues se eliminda
                if (!err) {
                  return reply({message : 'school deleted'})
                }else{
                  return reply(Boom.notFound('school not found'));// en caso de no encotrarlo se regresa el status not found
                }
            });
        }
    });

    //update school record
    server.route({
        method: 'PUT',
        path: '/school/{id}',
        config: {
          validate: {// se hacen las validaciones necesarias, el password se queda como opcional ya que puede no venir
             payload: {
                 name : Joi.string().required(),
             },
             params : {
                 id : Joi.string().required(),
             }
          }
        },
       handler: function(request, reply) {
           var payload = request.payload   // recivir parametros por post
           School.findById( request.params.id , function(err, school) {
               if (school) {//si se encuentra el school, se setea con sus nuevos valores
                   	school.name = payload.name;
                    school.save(function(err) {
                       if (!err){
                           return reply(school);
                       }else{
                           return reply(Boom.unauthorized('Invalid data. ' + err.message));
                       }
                   });
               }else{
                   return reply(Boom.notFound('User not found'));
               }
           });
       }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes-school'
};
