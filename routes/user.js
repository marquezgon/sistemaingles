'use strict';

const Joi = require('joi');
const Boom = require('boom');
const User = require('../models/user.js');
const Section = require('../models/section.js');
const Book = require('../models/book.js');
const Question = require('../models/question.js');
const Quiz = require('../models/quiz.js');
const Bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 12;
const jwt = require('jsonwebtoken');

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
                         scope: 'admin',
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

    //update user record
    server.route({
        method: 'PUT',
        path: '/users/{id}',
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
           User.findById( request.params.id , function(err, user) {
               if (user) {//si se encuentra el usuario, se setea con sus nuevos valores
                   user.name = payload.name;
                   user.username = payload.username;
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
            validate: { //como esta funcion solo cambia el password, marcamos como obligatorio el password
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

    //add book
    server.route({
        method: 'POST',
        path: '/users/book',
        config: {
            validate: { // Validamos que el tenga el id
            payload: {
                name : Joi.string().required()
            }
          }
        },
        handler: function(request, reply) {
        	Book.find({}, function(err, book) {
               if (!err) {
               		console.log(book);
               }
            });
           	Book.find({ name : request.payload.name }, function(err, book) {
               if (!err) {
                   if(book.length == 0 ){
                       	var newBook = Book({
                         	name: request.payload.name,
                         	status: (request.payload.status ? request.payload.status : 1),
                         	created :  new Date()
                       	});
                   	 	newBook.save(function(err) {
			                if (!err) {
			                  	return reply(newBook);
			                } else {
			                  	throw err;
		              	  	}
		              	});

                   } else {
                       return reply(Boom.conflict('Duplicated book'));
                   }
               }else{
               	return reply(Boom.badImplementation(err)); // 500 error
               }
            });
        }
    });

    //get Books
      server.route({
        method: 'GET',
        path: '/users/book',
        handler: function(request, reply) {
            Book.find( {} , function(err, book) {
                if (!err) {
                    return reply(book);
                }
                return reply(Boom.notFound('User not found')); // 404 error
            });
        }
    });

    //add Section
        server.route({
        method: 'POST',
        path: '/users/section',
        config: {
          	validate: {
            	payload: {
               		name : Joi.string().required(),
               		idBook : Joi.string().required(),
           		}
         	}
       	},
       	handler: function(request, reply) {
           var payload = request.payload   // recivir parametros por post
           Section.find({ name : payload.name, book : payload.idBook } , function(err, user) {
               if (!err) {
                   if(user.length == 0 ){
                       var newSection = Section({
                         name: payload.name,
                         book : payload.idBook,
                         status: (payload.status ? payload.status : 1),
                         created :  new Date()
                       });
                       newSection.save(function(err) {
			                if (!err) {
			                  	return reply(newSection);
			                } else {
			                  	throw err;
		              	  	}
		              	});

                   } else {
                       return reply(Boom.conflict('Duplicated section'));
                   }
               }else{
               		return reply(Boom.badImplementation(err)); // 500 error
               }
           });
       	}
    });

    server.route({
        method: 'GET',
        path: '/users/section',
        handler: function(request, reply) {
            Section.find( {} , function(err, section) {
                if (!err) {
                    return reply(section);
                }
                return reply(Boom.notFound('User not found')); // 404 error
            });
        }
    });

    //add questions
    server.route({
        method: 'POST',
        path: '/users/question',
        config: {
          	validate: {
            	payload: {
               		question : Joi.string().required(),
               		idSection : Joi.string().required(),
               		idBook : Joi.string().required(),
               		answer : Joi.string().required(),
           		}
         	}
       	},
       	handler: function(request, reply) {
           var payload = request.payload   // recivir parametros por post
           	Question.find({ question : payload.question, section : payload.idSection } , function(err, quiestion) {
               if (!err) {
                   if(quiestion.length == 0 ){
                   	console.log(payload);
                       var newQuestion = Question({
                         question : payload.question,
                         answer: payload.answer,
                         section : payload.idSection,
                         book : payload.idBook,
                         status: (payload.status ? payload.status : 1),
                         created :  new Date()
                       });
                       newQuestion.save(function(err) {
			                if (!err) {
			                  	return reply(newQuestion);
			                } else {
			                  	throw err;
		              	  	}
		              	});
                   } else {
                       return reply(Boom.conflict('Duplicated question'));
                   }
               }else{
               		return reply(Boom.badImplementation(err)); // 500 error
               }
           });
       	}
    });

    server.route({
        method: 'GET',
        path: '/users/question',
        handler: function(request, reply) {
            Question.find( {} , function(err, question) {
                if (!err) {
                    return reply(question);
                }
                return reply(Boom.notFound('Questions not found')); // 404 error
            });
        }
    });

    //add questions

    return next();
};

exports.register.attributes = {
    name: 'routes-users'
};
