'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Student = require('../models/student.js');
const Book = require('../models/book.js');
const Section = require('../models/section.js');
const Questions = require('../models/question.js');
const Quiz = require('../models/quiz.js');
const jwt = require('jsonwebtoken');

exports.register = function (server, options, next) {
    //fetch all students
    server.route({
        method: 'POST',
        path: '/quiz',
        config: {
         validate: {
            payload: {
               book : Joi.string().required(),
               section : Joi.string().optional(),
               student : Joi.string().required(),
               questions : Joi.number().integer().min(1).optional(),
           }
         }
        },
        handler: function(request, reply) {
        	var filter = { book : request.payload.book };
        	if(request.payload.section){
            var arrasySection = request.payload.section.split(',');
            var arrSectionFilter = [];
            for (var i = 0; i < arrasySection.length; i++) {
              if(arrasySection[i].trim()){
                arrSectionFilter.push(arrasySection[i].trim());
              }
            }
        		filter = { section: { $in : arrSectionFilter } , book : request.payload.book };
        	}
         	Questions.find(filter, function (err, questions) {
            if (err) {
              throw err;
            }

            var sects = [];
            questions.forEach(function(question) {
              sects.push({ text : question.question, idQuestion : question._id, idSection : question.section });
            });
            var newQuiz = Quiz({
              questions: sects,
              book: request.payload.book,
              student : request.payload.student,
              created: new Date(),
              status: 1
            });
            newQuiz.save(function(err) {
              if (!err) {
                reply(newQuiz).code(201);// 201
              } else {
                throw err;
              }
            });
          });
        } 
    });

    //get all quiz
    server.route({
      method: 'GET',
      path: '/quiz',
      config: {
        // auth : {
        //   strategy: 'jwt',
        //   mode: 'required'
        // }
      },
      handler: function(request, reply) {
          Quiz.find({}, function(err, quizes) {// Se ejecuta la busqueda sin parametros ya que se requieren todos los registros
              if (!err) {
                  return reply(quizes);//retornamos un arreglo con todos los objetos de la base de datos
              }
              return reply(Boom.badImplementation(err));
          });
      }
    });

        //delete given quiz
    server.route({
        method: 'DELETE',
        path: '/quiz/{id}',
        config: {
            validate: { // Validamos que el tenga el id
            params: {
                id : Joi.string().required()
            }
          }
        },
        handler: function(request, reply) {
            Quiz.findOneAndRemove({ _id : request.params.id }, function(err) {//buscamos el registro por su id i depues se eliminda
                if (!err) {
                  return reply({message : 'Quiz deleted'})
                }else{
                  return reply(Boom.notFound('Quiz not found'));// en caso de no encotrarlo se regresa el status not found
                }
            });
        }
    });

    
    return next();
};

exports.register.attributes = {
    name: 'routes-quiz'
};
