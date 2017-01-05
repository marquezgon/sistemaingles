var request = require('supertest');
require('../index.js');
require('should');
var server = request.agent("http://localhost:8000");
const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImdtYXJxdWV6IiwiaWQiOiI1ODU0NDFiNDE3ZWI1MDBlMzU4ZmQxZGQiLCJpYXQiOjE0ODM2NDUyOTMsImV4cCI6MTQ4MzY0ODg5M30.bQlDc_HooYBkpBk8iU_xVvpFNyOYPC3GG-8KCeXAD5U';

describe('Task routes', function () {
    describe('GET /users', function () {
        it('Get all users', function (done) {
            server
                .get('/users')
                .set('Authorization', token)
                .expect("Content-type", /json/)
                .expect(200)
                .end(function (err, res) {
                    res.status.should.equal(200);
                    done();
                });
        });
        it('get a user', function (done) {
            server
                .get('/users/5852dd9d57a6f489804e5ac7')
                .expect("Content-type", /json/)
                .expect(200)
                .end(function (err, res) {
                    res.status.should.equal(200);
                    done();
                });
        });
       it('get a user that does not exist', function (done) {
            server
                .get('/users/5852dd9dasf57a6f489804e5ac7')
                .expect("Content-type", /json/)
                .expect(404)
                .end(function (err, res) {
                    res.status.should.equal(404);
                    done();
                });
        });

    });
    describe('POST /users', function () {
        it('save  user', function (done) {
            server
                .post('/users')
                .send({
                    password: '3333',
                    username: 'noTesta'+new Date().getTime(),
                    name: 'nuevo',
                    lastname: 'test'
                })
                .expect("Content-type", /json/)
                .expect(200)
                .end(function (err, res) {
                    res.status.should.equal(200);
                    done();
                });
        });
        it('repeat username', function (done) {
            server
                .post('/users')
                .set('Authorization', token)
                .send({
                    password: '3333',
                    username: 'gmarquez12',
                    name: 'heyll',
                    lastname: 'test',
                })
                .expect("Content-type", /json/)
                .expect(409)
                .end(function (err, res) {
                    res.status.should.equal(409);
                    done();
                });
        });
        it('missing data', function (done) {
            server
                .post('/users')
                .send({
                    password: '3333',
                    lastname: 'test'
                })
                .expect("Content-type", /json/)
                .expect(400)
                .end(function (err, res) {
                    res.status.should.equal(400);
                    done();
                });
        });
    });
    describe('DELETE /users/5858012e5def1905cbd52881', function () {
        it('delete a user', function (done) {
            server
                .delete('/users/586ea5a2a08587e7af0b2fc9')
                .expect("Content-type", /json/)
                .expect(200)
                .end(function (err, res) {
                    res.status.should.equal(200);
                    done();
                });
        });
    });
    describe('PUT /users/5857ff6c8c4086042c1f8f21', function () {
        it('update  user', function (done) {
            server
                .put('/users/5857ff6c8c4086042c1f8f21')
                .send({
                    password: '33334',
                    username: 'test2',
                    name: 'nuevo',
                    lastname: 'test2'
                })
                .expect("Content-type", /json/)
                .expect(200)
                .end(function (err, res) {
                    res.status.should.equal(200);
                    done();
                });
        });
        it('missing data', function (done) {
            server
                .put('/users/5857ff6c8c4086042c1f8f21')
                .send({
                    password: '3333',
                    username: 'test2',
                })
                .expect("Content-type", /json/)
                .expect(400)
                .end(function (err, res) {
                    res.status.should.equal(400);
                    done();
                });
        });
        it('user not exist', function (done) {
            server
                .put('/users/5857ff6c8c40asds86042c1f8f22')
                .send({
                   password: '3333',
                    username: 'test2',
                    name: 'nuevo',
                    lastname: 'test2'
                })
                .expect("Content-type", /json/)
                .expect(404)
                .end(function (err, res) {
                    res.status.should.equal(404);
                    done();
                });
        });
    });
    describe('PATCH /users/5857ff6c8c4086042c1f8f21', function () {
        it('update user password', function (done) {
            server
                .patch('/users/5857ff6c8c4086042c1f8f21')
                .send({
                    password: '1234567',
                })
                .expect("Content-type", /json/)
                .expect(200)
                .end(function (err, res) {
                    res.status.should.equal(200);
                    done();
                });
        });
        it('missing data', function (done) {
            server
                .patch('/users/5857ff6c8c4086042c1f8f21')
                .expect("Content-type", /json/)
                .expect(400)
                .end(function (err, res) {
                    res.status.should.equal(400);
                    done();
                });
        });
        it('user does not exist', function (done) {
            server
                .patch('/users/5857ff6c8c4086042c1f8f28')
                .send({
                   password: '3333'
                })
                .expect("Content-type", /json/)
                .expect(404)
                .end(function (err, res) {
                    res.status.should.equal(404);
                    done();
                });
        });
    });
});
