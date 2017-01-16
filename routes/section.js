'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Section = require('../models/section.js');

exports.register = function (server, options, next) {

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

    return next();
};

exports.register.attributes = {
    name: 'routes-section'
};
