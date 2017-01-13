'use strict';

const User = require('../models/user.js');
const Student = require('../models/student.js');
const Teacher = require('../models/teacher.js');

exports.register = function (server, options, next) {
    const validate = (request, decodedToken, callback) => {
      var typeUser = getUserType(decodedToken.scope);
      typeUser.find({username: decodedToken.username}, function(err, user) {
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
        key: server.settings.app.secret,
        validateFunc: validate
    });

    return next();
};

function getUserType(scope) {
  var table = User;
  if(scope == 'student'){
    table = Student;
  }else if(scope == 'teacher'){
    table = Teacher;
  }
  return table;
}

exports.register.attributes = {
    name: 'plugins-auth',
    dependencies: ['hapi-auth-jwt']
};
