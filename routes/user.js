var Controller = require('../controller/UserController.js');

module.exports = [
    { method: 'POST', path: '/users/login', config: Controller.login},
    { method: 'GET', path: '/users', config: Controller.getAll },
    { method: 'GET', path: '/users/{id}', config: Controller.getUser },
    { method: 'DELETE', path: '/users/{id}', config: Controller.delete },
    { method: 'POST', path: '/users', config: Controller.create },
    { method: 'PUT', path: '/users/{id}', config: Controller.update },
    { method: 'PATCH', path: '/users/{id}', config: Controller.updatePass }
];
