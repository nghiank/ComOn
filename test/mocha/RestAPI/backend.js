'use strict';
var OxygenOauth = require('./oxygenOauth');
var mongoose = require('mongoose'),
    request = require('supertest'),
    User = mongoose.model('User');
require('../../../server');
var agent = request.agent('http://localhost:3001'),
    config = require('../../../config/config');


describe('e2e API Test', function() {
    var xauth;
    before(function (done) {
        xauth = new OxygenOauth('http://accounts-dev.autodesk.com','5f7de223-2148-479b-9ae1-e835f590c117','fb3d2f26-d89e-4ab5-9da4-d9c0664c3c9d');
        mongoose.createConnection('mongodb://localhost/ACE-test', function (error) {
            if (error) throw error; // Handle failed connection
            done();
        });
    });
    
    describe('User Controller', function() {
        var acess_token, acess_token_secret;
        var body;

        before(function(done) {
            this.timeout(config.timeout);
            var callback = function(e, at, at_s) {
                if(e) throw (e);
                if(!e)
                {
                    acess_token = at;
                    acess_token_secret = at_s;
                }
                done();
            };
            xauth.login('akaash.gupta@autodesk.com', 'Iceman123', callback);
        });

        it('should create test user and login', function(done) {
            this.timeout(config.timeout);
            agent
            .post('/xauth')
            .send({oauth_token: acess_token, oauth_verifier: acess_token_secret})
            .end(function(err,res) {
                (res.status).should.equal(302);
                done();
            });
        });

        it('Authorization for mobile devices', function(done) {
            this.timeout(config.timeout);
            xauth.get('http://localhost:3001/api/users/me', function(err, res, b){
                (b.statusCode).should.equal(200);
                done();
            });
        });

        it('GET /users/me should return 200', function(done){
            agent
            .get('/api/users/me', {json: true})
            .end(function(err, res){
                //validate the keys in the response JSON matches, we dont care about the values
                (res.status).should.equal(200);
                (res.body).should.have.properties('name','email','provider','lastLogin','_id','__v','codeName','isManufacturer','isAdmin','Id');
                if(res.status === 200)
                {
                    body = res.body;
                }
                done();
            });
        });

        it('GET /makeAdmin should make me Admin', function(done) {
            this.timeout(config.timeout);
            agent
            .get('/api/makeAdmin/Akaash Gupta')
            .end(function(err,res) {
                (res.status).should.equal(302);
                done();
            });
        });

        it('GET /users should return 200', function(done){
            agent
            .get('/api/users')
            .end(function(err, res){
                //validate the keys in the response JSON matches, we dont care about the values
                (res.status).should.equal(200);
                (res.body[0]).should.have.properties('name','email','provider','lastLogin','_id','__v','codeName','isManufacturer','isAdmin','Id');
                done();
            });
        });

        it('GET /users/:ID should return 200', function(done){
            agent
            .get('/api/users/'+body._id)
            .end(function(err, res){
                //validate the keys in the response JSON matches, we dont care about the values
                (res.status).should.equal(200);
                (res.body).should.have.properties('name','email','provider','lastLogin','_id','__v','codeName','isManufacturer','isAdmin','Id');
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

        it('GET /users/me should return 401', function(done){
            agent
            .get('/api/users/me')
            .end(function(err, res){
                //validate the keys in the response JSON matches, we dont care about the values
                (res.status).should.equal(401);
                done();
            });
        });

    });
    after(function(done) {
        User.remove().exec();
        done();
    });
});