var Controller = require('../controller/UserController.js');

module.exports = [
    { method: 'GET', path: '/users', handler: function () {} },
    { method: 'GET', path: '/users/{id}', config: Controller.getUser },
    { method: 'POST', path: '/users/login', config: Controller.login}
];
