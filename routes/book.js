'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Section = require('../models/section.js');

exports.register = function (server, options, next) {

    server.route({
        method: 'GET',
        path: '/book/sections',
        config : {
        	auth : {
            scope : ['admin' , 'teacher'],
            strategy: 'jwt',
            mode: 'required'
          },
          cors: {
              origin: ['*'],
              additionalHeaders: ['cache-control', 'x-requested-with']
          }
        },
        handler: function(request, reply) {
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
			  	reply(response);
			});
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes-book'
};
