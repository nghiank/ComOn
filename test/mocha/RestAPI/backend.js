'use strict';
var OxygenOauth = require('./oxygenOauth');
var mongoose = require('mongoose'),
    request = require('supertest'),
    User = mongoose.model('User');
require('../../../server');
var agent = request.agent('http://localhost:3001');


describe('e2e API Test', function() {
    var xauth;
    var acess_token_secret = 'MdktTsU%3D', acess_token = 'NT2L%2FFIJda01hoaIx34ZHQjr3vU%3D';
    before(function (done) {
        xauth = new OxygenOauth('http://accounts-dev.autodesk.com','5f7de223-2148-479b-9ae1-e835f590c117','fb3d2f26-d89e-4ab5-9da4-d9c0664c3c9d');
        mongoose.createConnection('mongodb://localhost/ACE-test', function (error) {
            if (error) throw error; // Handle failed connection
            done();
        });
    });
    describe('Testing Xauth Library', function() {
        this.timeout(8000);
        it('should get an access token', function(done) {
            var callback = function(e) {
                (e === null).should.be.true;
                done();
            };
            xauth.login('akaash.gupta@autodesk.com', 'Iceman123', callback);
        });
    });

    describe('Testing Passport', function() {
        it('should fail and give an error', function(done) {
            agent
            .get('/auth/oauth/callback?oauth_verifier='+acess_token_secret+'&oauth_token='+acess_token)
            .end(function(err,res) {
                res.status.should.equal(500);
                done();
            });
        });
    });
    
    describe('User Controller', function() {
        var acess_token, acess_token_secret;
        var body;

        before(function(done) {
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
            this.timeout(50000);
            agent
            .post('/xauth')
            .send({oauth_token: acess_token, oauth_verifier: acess_token_secret})
            .end(function(err,res) {
                (res.status).should.equal(302);
                done();
            });
        });

        it('Authorization for mobile devices', function(done) {
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
                if(res.status === 200)
                {
                    body = res.body;
                }
                done();
            });
        });

        it('GET /makeAdmin should make me Admin', function(done) {
            this.timeout(50000);
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
                done();
            });
        });

        it('GET /users/:ID should return 200', function(done){
            agent
            .get('/api/users/'+body._id)
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