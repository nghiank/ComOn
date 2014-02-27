'use strict';
var OxygenOauth = require('./oxygenOauth'),
    mongoose = require('mongoose'),
    request = require('supertest'),
    User = mongoose.model('User'),
    SchematicComponent = mongoose.model('SchematicComponent'),
    SchematicStandard = mongoose.model('SchematicStandard'),
    agent = request.agent('http://localhost:3001'),
    config = require('../../../config/config');

require('../../../server');

describe('<e2e API Test>', function() {
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

        //test update Code Name
        it('GET /updateCodeName should update my code name', function(done) {
            this.timeout(config.timeout);
            agent
            .get('/api/updateCodeName/AG')
            .end(function(err,res) {
                (res.status).should.equal(200);
                (res.body.name).should.equal('Akaash Gupta');
                (res.body.codeName).should.equal('AG');
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

    describe('Schematics Controller', function() {
        var acess_token, acess_token_secret;
        var id;

        before(function(done) {
            this.timeout(config.timeout);
            var callback = function(e, at, at_s) {
                if(e) throw (e);
                if(!e)
                {
                    acess_token = at;
                    acess_token_secret = at_s;
                }
                agent
                .post('/xauth')
                .send({oauth_token: acess_token, oauth_verifier: acess_token_secret})
                .end(function(err,res) {
                    (res.status).should.equal(302);
                    done();
                });
            };
            xauth.login('akaash.gupta@autodesk.com', 'Iceman123', callback);
        });

        it('POST /api/upload should return 200', function(done) {
            this.timeout(config.timeout);
            agent.post('/api/upload')
            .field('stdName', 'abcd')
            .attach('datFile', './test/mocha/RestAPI/ACE_JIC_MENU.dat')
            .attach('jsonFile', './test/mocha/RestAPI/mapping.json')
            .end(function(err, res) {
                res.should.have.status(200);
                done();
            });
        });

        it('POST /api/upload with only one file should return 400', function(done) {
            this.timeout(config.timeout);
            agent.post('/api/upload')
            .field('stdName', 'abcd')
            .attach('datFile', './test/mocha/RestAPI/ACE_JIC_MENU.dat')
            .end(function(err, res) {
                res.should.have.status(400);
                done();
            });
        });

        it('POST /api/upload with invalid file should return 400', function(done) {
            this.timeout(config.timeout);
            agent.post('/api/upload')
            .field('stdName', 'abcd')
            .attach('datFile', './test/mocha/RestAPI/oxygenOauth.js')
            .end(function(err, res) {
                res.should.have.status(400);
                done();
            });
        });

        it('GET /api/getSchemStds should return 200 with the list of schematics', function(done) {
            this.timeout(config.timeout);
            xauth.get('http://localhost:3001/api/getSchemStds', function(err, res, b){
                var result = JSON.parse(res)[0];
                (result.name).should.equal('JIC: Schematic Symbols');
                (b.statusCode).should.equal(200);
                id = result._id;
                done();
            });
        });

        it('GET /api/getChildren/:nodeId with invalid componentId should return 400', function(done) {
            this.timeout(config.timeout);
            xauth.get('http://localhost:3001/api/getChildren/asdjfhisweuhf', function(err, res, b){
                (b.statusCode).should.equal(400);
                done();
            });
        });

        it('GET /api/getChildren/:nodeId with valid Id should return the children with status 200', function(done) {
            this.timeout(config.timeout);
            xauth.get('http://localhost:3001/api/getChildren/'+id, function(err, res, b){
                var result = JSON.parse(res);
                (result.children.length).should.equal(17);
                (b.statusCode).should.equal(200);
                done();
            });
        });

        it('GET /api/getParentHiearchy/:nodeId with invalid componentId should return 400', function(done) {
            this.timeout(config.timeout);
            xauth.get('http://localhost:3001/api/getParentHiearchy/asdjfhisweuhf', function(err, res, b){
                (b.statusCode).should.equal(400);
                done();
            });
        });

        it('GET /api/getParentHiearchy/:nodeId with valid Id should return the parent hiearchy of the node with status 200', function(done) {
            this.timeout(config.timeout);
            xauth.get('http://localhost:3001/api/getParentHiearchy/'+id, function(err, res, b){
                var result = JSON.parse(res);
                (result.parentHiearchy.length).should.equal(1);
                (result.parentHiearchy[0].title).should.equal('JIC: Schematic Symbols');
                (b.statusCode).should.equal(200);
                done();
            });
        });

        it('GET /signout should logout', function(done){
            agent
            .get('/signout')
            .end(function(err, res){
                (res.status).should.equal(302);
                done();
            });
        });

        it('POST without credentials /api/upload should return 401', function(done) {
            this.timeout(config.timeout);
            agent.post('/api/upload')
            .field('stdName', 'abcd')
            .attach('datFile', './test/mocha/RestAPI/ACE_JIC_MENU.dat')
            .attach('jsonFile', './test/mocha/RestAPI/mapping.json')
            .end(function(err, res) {
                (res.status).should.equal(401);
                done();
            });
        });

        it('GET /api/getSchemStds without login returns 200', function(done) {
            this.timeout(config.timeout);
            agent.get('/api/getSchemStds').end(function(err, res) {
                var result = res.body[0];
                (result.name).should.equal('JIC: Schematic Symbols');
                (res.statusCode).should.equal(200);
                done();
            });
        });

    });

    after(function(done) {
        User.remove().exec();
        SchematicComponent.remove().exec();
        SchematicStandard.remove().exec();
        done();
    });
});