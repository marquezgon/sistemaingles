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
               description : Joi.string().max(40).optional(),
               student : Joi.string().required(),
               title : Joi.string().required(),
               questions : Joi.number().integer().min(1).optional(),
            }
          },
          auth : {
            scope : ['admin', 'student'],
            strategy: 'jwt',
            mode: 'required'
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
              return reply(Boom.badRequest('invalid params'));
            }

            var sects = [];
            questions.forEach(function(question) {
              sects.push({ text : question.question, idQuestion : question._id, idSection : question.section, answer : question.answer, StudentAnswer : '' });
            });
            var newQuiz = Quiz({
              questions: sects,
              book: request.payload.book,
              description: request.payload.description,
              student : request.payload.student,
              title : request.payload.title,
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
        auth : {
          scope : ['admin', 'student'],
          strategy: 'jwt',
          mode: 'required'
        }
      },
      handler: function(request, reply) {
        var filter = {};
        if(request.auth.credentials.scope == 'student'){
          filter = { student : request.auth.credentials.id };
        }
        Quiz.find( filter , function(err, quizes) {// Se ejecuta la busqueda sin parametros ya que se requieren todos los registros
            if (!err) {
              Section.find({})
              .populate('book', 'name')
              .sort({book: 1})
              .exec(function (err, section) {
                if (err) {
                        return reply(Boom.badRequest('invalid params'));
                      }

                var arrTemp = [];
                var bookSection = [];
                var response = {};
                
                  section.forEach(function(sectionAndBook) {
                          if(arrTemp.indexOf(sectionAndBook.book.id) == '-1'){
                            arrTemp.push(sectionAndBook.book.id);
                    bookSection = []; 
                          }
                          bookSection.push(sectionAndBook);
                          response[sectionAndBook.book.name] = bookSection;
                      });
                  return reply({sectionAndBooks : response, quizes : quizes});//retornamos un arreglo con todos los objetos de la base de datos
              });
            }else{
              return reply(Boom.badImplementation(err));
            }
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
          },
          auth : {
            scope : ['admin', 'student'],
            strategy: 'jwt',
            mode: 'required'
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
