'use strict';

var mongoose = require('mongoose'),
    request = require('supertest'),
    User = mongoose.model('User');
require('../../../server');
var agent = request.agent('http://localhost:3001');
describe('e2e API Test', function() {
    before(function (done) {
        mongoose.createConnection('mongodb://localhost/ACE-test', function (error) {
            if (error) throw error; // Handle failed connection
            done();
        });
    });
    describe('User Controller', function() {
        it('should create test user and login', function(done) {
            this.timeout(50000);
            agent
            .post('/createTestUsers')
            .send({email: 'Test@test.com', username: 'sefwef', name: 'test', isAdmin: false})
            .end(function(err,res) {
                (res.status).should.equal(302);
                done();
            });
        });
        it('should create another test user and login', function(done) {
            this.timeout(50000);
            agent
            .post('/createTestUsers')
            .send({email: 'Test2@test.com', username: 'seasdfwef', name: 'test2', isAdmin: true})
            .end(function(err,res) {
                (res.status).should.equal(302);
                done();
            });
        });
        it('GET /users/me should return 200', function(done){
            agent
            .get('/users/me')
            .end(function(err, res){
                //validate the keys in the response JSON matches, we dont care about the values
                (res.status).should.equal(200);
                done();
            });
        });
        it('GET /users should return 200', function(done){
            agent
            .get('/users')
            .end(function(err, res){
                //validate the keys in the response JSON matches, we dont care about the values
                (res.status).should.equal(200);
                done();
            });
        });
        it('GET /signout should logout', function(done){
            agent
            .get('/signout')
            .end(function(err, res){
                //validate the keys in the response JSON matches, we dont care about the values
                (res.status).should.equal(302);
                done();
            });
        });
        it('GET /users/me should return 500', function(done){
            agent
            .get('/users/me')
            .end(function(err, res){
                //validate the keys in the response JSON matches, we dont care about the values
                (res.status).should.equal(500);
                done();
            });
        });
    });
    after(function(done) {
        User.remove().exec();
        done();
    });
});