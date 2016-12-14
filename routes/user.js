module.exports = [
    { method: 'GET', path: '/users', handler: function () {} },
    { method: 'GET', path: '/users/{id}', handler: function () {} },
    { method: 'POST', path: '/users/login', handler: function (request, reply) {
    	console.log(request.params);
    	//next();
    } }
];
