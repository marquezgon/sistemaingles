'use strict';

const User = require('../models/user.js');
const secret = 'm3x3rp';

exports.register = function (server, options, next) {
    const validate = (request, decodedToken, callback) => {
      User.findById(decodedToken.id, function(err, user) {
          if (!err) {
              if(user) {
                return callback(null, true, decodedToken);
              }
              return callback(null, false, decodedToken);
          }
          return callback(null, false, decodedToken);
      });
    };

    server.auth.strategy('jwt', 'jwt', {
        key: secret,
        validateFunc: validate
    });

    return next();
};

exports.register.attributes = {
    name: 'auth',
    dependencies: ['hapi-auth-jwt']
};
