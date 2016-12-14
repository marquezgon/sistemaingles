var Controller = require('../controller/UserController.js');

module.exports = [
    { method: 'GET', path: '/users', handler: function () {} },
    { method: 'GET', path: '/users/{id}', handler: function () {} },
    { method: 'POST', path: '/users/login', config: Controller.getAll}
];
