var Joi = require('joi'),
    Boom = require('boom'),
    User = require('../models/user.js');

exports.getAll = {
    handler: function(request, reply) {
        console.log('Entro');
        var payload = request.payload   // recivir parametros por post
        // var payload = request.query   // recivir parametros por get
        // reply(payload)
      

        User.find({}, function(err, user) {
            if (!err) {
                reply(Boom.badImplementation(err)); // 500 error
            } 
            reply(user);
        });
    }
};
