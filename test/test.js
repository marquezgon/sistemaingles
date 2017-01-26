var request = require('supertest');
require('../index.js');
require('should');
var server = request.agent("http://localhost:8000");

describe('Task routes', function () {

    var token = null;
    //login and generate a token before each test runs
    before((done) => {
        server
            .post('/users/login')
            .send({
                username: 'gmarquez@mexerp.com',
                password: 'manchi89'
            })
            .end((err, res) => {
                token = res.body.token;
                done();
            })
    });

    var tokenStudent = null;
    //login and generate a token before each test runs
    before((done) => {
        server
            .post('/student/login')
            .send({
                username: 'rmena@mexerp.com',
                password: 'manchi89'
            })
            .end((err, res) => {
                tokenStudent = res.body.token;
                done();
            })
    });

    // validate all function of user`s module
    describe('GET /users', function () {
        it('Get all users', function (done) {
            // console.log(token);
            server
                .get('/users')
                .set('Authorization', `Bearer ${token}`)
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
                .set('Authorization', `Bearer ${token}`)
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
                .set('Authorization', `Bearer ${token}`)
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
                .set('Authorization', `Bearer ${token}`)
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
                .set('Authorization', `Bearer ${token}`)
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
                .set('Authorization', `Bearer ${token}`)
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
                .set('Authorization', `Bearer ${token}`)
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
                .set('Authorization', `Bearer ${token}`)
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
                .set('Authorization', `Bearer ${token}`)
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
                .set('Authorization', `Bearer ${token}`)
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
                .set('Authorization', `Bearer ${token}`)
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
    // end validation user`s model

    // validate all function of quiz`s module
   describe('GET /quiz', function () {
        it('Get all quizes', function (done) {
            server
                .get('/quiz')
                .set('Authorization', `Bearer ${tokenStudent}`)
                .expect("Content-type", /json/)
                .expect(200)
                .end(function (err, res) {
                    res.status.should.equal(200);
                    done();
                });
        });
    });
    describe('POST /quiz', function () {
        // it('save quiz', function (done) {
        //     server
        //         .post('/quiz')
        //         .set('Authorization', `Bearer ${token}`)
        //         .send({
        //             book: '58768988e048a822e7161332',
        //             section: '5876a4d4b02a3424c3dbee10,5876a514eba64e24c80b0348',
        //             student: '5877d5e24dfe6b2fbb73e743',
        //             title: 'test',
        //         })
        //         .expect("Content-type", /json/)
        //         .expect(201)
        //         .end(function (err, res) {
        //             res.status.should.equal(201);
        //             done();
        //         });
        // });
        it('missing data', function (done) {
            server
                .post('/users')
                .set('Authorization', `Bearer ${token}`)
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
    describe('DELETE /quiz/5877e78761456b31b9155ea7', function () {
        it('delete a quiz', function (done) {
            server
                .delete('/quiz/5877e78761456b31b9155ea7')
                .set('Authorization', `Bearer ${token}`)
                .expect("Content-type", /json/)
                .expect(200)
                .end(function (err, res) {
                    res.status.should.equal(200);
                    done();
                });
        });
    });
    // end validation quiz`s model

    // validate all function of teacher`s module
    describe('POST /teacher', function () {
        it('save  teacher', function (done) {
            server
                .post('/teacher')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    username: 'yo@yo.com' + new Date().getTime(),
                    password: 'raul123',
                    name: 'Raul',
                    lastname: 'Mena',
                })
                .expect("Content-type", /json/)
                .expect(201)
                .end(function (err, res) {
                    res.status.should.equal(201);
                    done();
                });
        });
        it('missing data', function (done) {
            server
                .post('/teacher')
                .set('Authorization', `Bearer ${token}`)
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
    describe('DELETE /teacher/5877e78761456b31b9155ea7', function () {
        it('delete a teacher', function (done) {
            server
                .delete('/teacher/5877e78761456b31b9155ea7')
                .set('Authorization', `Bearer ${token}`)
                .expect("Content-type", /json/)
                .expect(200)
                .end(function (err, res) {
                    res.status.should.equal(200);
                    done();
                });
        });
    });
    // end validation teacher`s model

    // validate all function of school`s module
    describe('POST /school', function () {
        it('save  school', function (done) {
            server
                .post('/school')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Raul' + new Date().getTime(),
                })
                .expect("Content-type", /json/)
                .expect(201)
                .end(function (err, res) {
                    res.status.should.equal(201);
                    done();
                });
        });
        it('missing data', function (done) {
            server
                .post('/school')
                .set('Authorization', `Bearer ${token}`)
                .send({
                })
                .expect("Content-type", /json/)
                .expect(400)
                .end(function (err, res) {
                    res.status.should.equal(400);
                    done();
                });
        });
    });
    describe('DELETE /school/5877e78761456b31b9155ea7', function () {
        it('delete a school', function (done) {
            server
                .delete('/school/5877e78761456b31b9155ea7')
                .set('Authorization', `Bearer ${token}`)
                .expect("Content-type", /json/)
                .expect(200)
                .end(function (err, res) {
                    res.status.should.equal(200);
                    done();
                });
        });
    });
    // end validation school`s model

    // validate all function of book`s module
    describe('Get /book/sections', function () {
        it('get the book´s sections', function (done) {
            server
                .get('/book/sections')
                .set('Authorization', `Bearer ${token}`)
                .expect("Content-type", /json/)
                .expect(200)
                .end(function (err, res) {
                    res.status.should.equal(200);
                    done();
                });
        });
    });
    // end validation school`s model
});
