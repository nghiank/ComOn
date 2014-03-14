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
        User.remove().exec();
        this.timeout(config.timeout);
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
                (JSON.parse(res)).should.have.properties('name','email','lastLogin','_id','__v','codeName','isManufacturer','isAdmin','Id');
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
                (res.body).should.have.properties('name','email','lastLogin','_id','__v','codeName','isManufacturer','isAdmin','Id');
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

        it('GET /users/:ID should make me a Manufacturer and return 200', function(done){
            agent
            .get('/api/users/'+body._id)
            .end(function(err, res){
                //validate the keys in the response JSON matches, we dont care about the values
                (res.status).should.equal(200);
                (res.body).should.have.properties('name','email','lastLogin','_id','__v','codeName','isManufacturer','isAdmin','Id');
                (res.body.isManufacturer).should.equal(true);
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

        it('GET api/users/me without credentials should return 401', function(done){
            agent
            .get('/api/users/me')
            .end(function(err, res){
                (res.status).should.equal(401);
                done();
            });
        });
        it('POST api/addSchemFav without credentials should return 401', function(done){
            agent
            .post('/api/addSchemFav')
            .end(function(err, res){
                (res.status).should.equal(401);
                done();
            });
        });

        it('GET api/getFav without credentials should return 401', function(done){
            agent
            .get('/api/getFav')
            .end(function(err, res){
                (res.status).should.equal(401);
                done();
            });
        });

        it('POST api/delSchemFav without credentials should return 401', function(done){
            agent
            .post('/api/delSchemFav')
            .end(function(err, res){
                (res.status).should.equal(401);
                done();
            });
        });

        describe('For testing Add, Delete Schem Fav and geting favourite list', function() {
            var component_id = '';
            before(function(done) {
                this.timeout(config.timeout*3);
                SchematicComponent.remove().exec(function() {
                    SchematicStandard.remove().exec(function() {
                        agent
                        .post('/xauth')
                        .send({oauth_token: acess_token, oauth_verifier: acess_token_secret})
                        .end(function(err,res) {
                            (res.status).should.equal(302);
                            agent.post('/api/upload')
                            .attach('datFile', './test/mocha/RestAPI/ACE_JIC_MENU.dat')
                            .attach('jsonFile', './test/mocha/RestAPI/mapping.json')
                            .end(function(err, res) {
                                res.should.have.status(200);

                                function getComponentId() {
                                    agent.get('/api/getSchemStds')
                                    .end(function(err, res) {
                                        (res.status).should.equal(200);
                                        agent.get('/api/getChildren/'+res.body[0]._id)
                                        .end(function(err, res) {
                                            (res.status).should.equal(200);
                                            agent.get('/api/getChildren/'+res.body.children[0]._id)
                                            .end(function(err, res) {
                                                (res.status).should.equal(200);
                                                for (var i = 0; i < res.body.children.length; i++) {
                                                    var child = res.body.children[i];
                                                    if(!child.isComposite)
                                                    {
                                                        component_id = child._id;
                                                        done();
                                                        return;
                                                    }
                                                }
                                                done();
                                            });
                                        });
                                    });
                                }
                                setTimeout(getComponentId, 500);
                            });
                        });
                    });
                });
            });
            it('POST /api/addSchemFav with valid id should return 200', function(done) {
                (component_id).should.not.equal('');
                agent.post('/api/addSchemFav')
                .send({_id: component_id})
                .end(function(err, res) {
                    (res.status).should.equal(200);
                    done();
                });
            });

            it('GET /api/getFav should return updated fav list with one fav', function(done){
                agent
                .get('/api/getFav', {json: true})
                .end(function(err, res){
                    (res.body.schematic.length).should.equal(1);
                    (res.status).should.equal(200);
                    done();
                });
            });

            it('POST /api/delSchemFav with valid id should return 200', function(done) {
                (component_id).should.not.equal('');
                agent.post('/api/delSchemFav')
                .send({_id: component_id})
                .end(function(err, res) {
                    (res.status).should.equal(200);
                    done();
                });
            });

            it('GET /api/getFav should return updated fav list with no favs', function(done){
                agent
                .get('/api/getFav', {json: true})
                .end(function(err, res){
                    (res.status).should.equal(200);
                    (res.body.schematic.length).should.equal(0);
                    done();
                });
            });

            after(function(done) {
                SchematicComponent.remove().exec(function() {
                    SchematicStandard.remove().exec(function() {
                        setTimeout(done, 500);
                    });
                });
            });
        });
    });

    describe('Schematics Controller', function() {
        var acess_token, acess_token_secret;
        var id, standard_id, node;

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

        describe('Before delete', function() {
            it('POST /api/upload should return 200', function(done) {
                this.timeout(config.timeout);
                agent.post('/api/upload')
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
                .attach('datFile', './test/mocha/RestAPI/ACE_JIC_MENU.dat')
                .end(function(err, res) {
                    res.should.have.status(400);
                    done();
                });
            });

            it('POST /api/upload with invalid file should return 400', function(done) {
                this.timeout(config.timeout);
                agent.post('/api/upload')
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
                    standard_id = result.standard._id;
                    node = result;
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

            it('POST /api/editStd should return updated standard with 200', function(done) {
                this.timeout(config.timeout);
                agent
                .post('/api/editStd')
                .send({standardId: standard_id, stdName: 'JIC',desc: 'pass'})
                .end(function(err, res) {
                    (res.body.name).should.equal('JIC');
                    (res.status).should.equal(200);
                    done();
                });
            });

            it('POST /api/editStd for an invalid standard Id should return 400', function(done) {
                this.timeout(config.timeout);
                agent
                .post('/api/editStd')
                .send({standardId: 'sfrgsdfs', stdName: 'JIC',desc: 'fail'})
                .end(function(err, res) {
                    (res.status).should.equal(400);
                    done();
                });
            });

            it('POST /api/editComponent should return updated component with 200', function(done) {
                this.timeout(config.timeout);
                agent
                .post('/api/editComponent')
                .send({node: {_id: id,name: 'JIC2'}})
                .end(function(err, res) {
                    (res.body.name).should.equal('JIC2');
                    (res.status).should.equal(200);
                    done();
                });
            });

            it('POST /api/editComponent for an invalid component Id should return 400', function(done) {
                this.timeout(config.timeout);
                agent
                .post('/api/editComponent')
                .send({node: {_id: 'dsajhfiuwhes',name: 'JIC2'}})
                .end(function(err, res) {
                    (res.status).should.equal(400);
                    done();
                });
            });

            it('GET api/getNode with a valid id should return the component with status 200', function(done) {
                agent
                .get('/api/getNode/'+id)
                .end(function(err, res) {
                    (res.status).should.equal(200);
                    (res.body.name).should.equal('JIC2');
                    done();
                });
            });

            it('GET api/getNode with an invalid id should return 400', function(done) {
                agent
                .get('/api/getNode/dhdhg')
                .end(function(err, res) {
                    (res.status).should.equal(400);
                    done();
                });
            });

            it('POST api/isUniqueId without an Id should return 400', function(done) {
                agent
                .post('/api/isUniqueId')
                .send({standardId: standard_id})
                .end(function(err, res) {
                    (res.status).should.equal(400);
                    done();
                });
            });

            it('POST api/isUniqueId without a standard id should return 400', function(done) {
                agent
                .post('/api/isUniqueId')
                .send({id: id})
                .end(function(err, res) {
                    (res.status).should.equal(400);
                    done();
                });
            });

            it('POST api/isUniqueId with valid id and standardId should return true with status 200', function(done) {
                agent
                .post('/api/isUniqueId')
                .send({id: 'asdasda', standardId: standard_id})
                .end(function(err, res) {
                    (res.body.unique).should.equal(true);
                    (res.status).should.equal(200);
                    done();
                });
            });

            it('POST api/createNode without a proper parent will return 400', function(done) {
                agent
                .post('/api/createNode')
                .send({node: {name: 'asdasd', id: 'asdasd', parentNode: 'as21asd', standard: standard_id}})
                .end(function(err, res) {
                    (res.status).should.equal(400);
                    done();
                });
            });

            it('POST api/createNode with a proper node (unique name, id, parent combination) will return the created component with status 200', function(done) {
                agent
                .post('/api/createNode')
                .send({node: {name: 'asdasd', id: 'test_id', parentNode: id, standard: standard_id}})
                .end(function(err, res) {
                    (res.status).should.equal(200);
                    (res.body.name).should.equal('asdasd');
                    (res.body.id).should.equal('test_id');
                    done();
                });
            });

            it('GET /api/delete/:nodeId with an invalid Id should return 400', function(done) {
                this.timeout(config.timeout);
                agent.get('/api/delete/asdwqeq')
                .end(function(err, res) {
                    (res.status).should.equal(400);
                    done();
                });
            });


            it('GET /api/delete/:nodeId with a valid Id should return 200', function(done) {
                this.timeout(config.timeout);
                xauth.get('http://localhost:3001/api/delete/'+id, function(err, res, b) {
                    (b.statusCode).should.equal(200);
                    done();
                });
            });

        });
        describe('After delete - testing authorization for various API', function() {
            var test_node = {name: 'test',id: '123saasd',standard: 'asdasdas'};
            before(function(done) {
                this.timeout(config.timeout);
                agent.post('/api/upload')
                .attach('datFile', './test/mocha/RestAPI/ACE_JIC_MENU.dat')
                .attach('jsonFile', './test/mocha/RestAPI/mapping.json')
                .end(function(err, res) {
                    res.should.have.status(200);
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

            it('POST /api/upload without credentials should return 401', function(done) {
                this.timeout(config.timeout);
                function delay() {
                    agent.post('/api/upload')
                    .attach('datFile', './test/mocha/RestAPI/ACE_JIC_MENU.dat')
                    .attach('jsonFile', './test/mocha/RestAPI/mapping.json')
                    .end(function(err, res) {
                        (res.status).should.equal(401);
                        done();
                    });
                }
                setTimeout(delay, 500);
            });

            it('GET /api/getSchemStds without credentials returns 200', function(done) {
                this.timeout(config.timeout);
                agent.get('/api/getSchemStds').end(function(err, res) {
                    var result = res.body[0];
                    (result.name).should.equal('JIC: Schematic Symbols');
                    (res.statusCode).should.equal(200);
                    id = result._id;
                    standard_id = result.standard;
                    done();
                });
            });

            it('GET /api/getNode without credentials should return component with status 200', function(done) {
                agent
                .get('/api/getNode/'+id)
                .end(function(err, res) {
                    (res.status).should.equal(200);
                    (res.body.name).should.equal('JIC: Schematic Symbols');
                    done();
                });
            });

            it('POST /api/isUniqueId without credentials should return 401', function(done) {
                agent
                .post('/api/isUniqueId')
                .send({id: id, standardId: standard_id})
                .end(function(err, res) {
                    (res.status).should.equal(401);
                    done();
                });
            });

            it('POST /api/createNode without credentials should return 401', function(done) {
                agent
                .post('/api/createNode')
                .send({node: test_node})
                .end(function(err, res) {
                    (res.status).should.equal(401);
                    done();
                });
            });

            it('GET /api/delete/:nodeId without credentials should return 401', function(done) {
                this.timeout(config.timeout);
                agent
                .get('/api/delete/'+id)
                .end(function(err, res) {
                    (res.status).should.equal(401);
                    done();
                });
            });

            it('POST /api/editStd without credentials should return 401', function(done) {
                this.timeout(config.timeout);
                agent
                .post('/api/editStd')
                .end(function(err, res) {
                    (res.status).should.equal(401);
                    done();
                });
            });

            it('POST /api/editComponent without credentials should return 401', function(done) {
                this.timeout(config.timeout);
                agent
                .post('/api/editComponent')
                .end(function(err, res) {
                    (res.status).should.equal(401);
                    done();
                });
            });
        });
    });

    after(function(done) {
        User.remove().exec(function(){
            SchematicComponent.remove().exec(function() {
                SchematicStandard.remove().exec(function() {
                    setTimeout(done, 500);
                });
            });
        });
    });
});