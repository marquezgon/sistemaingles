'use strict';

const Joi = require('joi');
const Boom = require('boom');
var Bcrypt = require('bcrypt');
const User = require('../models/user.js');
const Student = require('../models/student.js');
const Teacher = require('../models/teacher.js');
const jwt = require('jsonwebtoken');

exports.register = function(server, options, next) {
    const createToken = function (user, type) {
        try {
            let userObj = user[0];
            // Sign the JWT
            return jwt.sign({ username: userObj.username, id: userObj._id }, server.settings.app.secret, { algorithm: 'HS256', expiresIn: 60*60*24*120 } );
        } catch (err) {
            throw err;
        }
    }

  //login users
  server.route({
      method: 'POST',
      path: '/{type}/login',
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
          const userType = request.params.type;
          switch(userType) {
            case 'users':
                generateToken('user', User, payload, reply);
                break;
            case 'student':
                generateToken('student', Student, payload, reply);
                break;
            case 'teacher':
                generateToken('teacher', Teacher, payload, reply);
                break;
            default:
                reply(Boom.notFound('Unknown route'));
          }
      }
  });

  return next();

  function generateToken(typeUser, typeObject, payload, reply) {
    try{
      typeObject.find({username : payload.username }, function(err, user) {//Se ejecuta la busqueda con el parametro de username
        if (err) throw err;
          if (user.length > 0) {//en caso de encontrar al usuario comparamos su password con la encriptacion Bcrypt
            Bcrypt.compare(payload.password , user[0].password, function(err, isMatch) {
                if(err) {
                   return reply(Boom.badImplementation(err)); // 500 error
              } else{
                if(isMatch){// isMatch indica si los passwords son iguales o no
                  return reply({ token: createToken(user, typeUser) }).code(201);
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
}


exports.register.attributes = {
    name: 'routes-auth'
};
