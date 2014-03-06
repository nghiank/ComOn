'use strict';

// User routes use users controller
var users = require('../controllers/users');
var authorization = require('./middlewares/authorization');
var error = require('../utils/error');

var hasAuthorization = function(req, res, next) {
    if (!req.user || (req.user && req.user.isAdmin === false)) {
        return error.sendUnauthorizedError(res);
    }
    next();
};

module.exports = function(app, passport) {

    app.get('/signout', users.signout);
    app.get('/api/users/me', authorization.requiresLogin , users.me);
    app.get('/api/users', authorization.requiresLogin , hasAuthorization, users.all);

    app.get('/api/makeAdmin/:name', authorization.requiresLogin , users.makeAdmin);
    app.param('name', users.findByName);

    app.get('/api/users/:userId', authorization.requiresLogin, hasAuthorization, users.changeStatus);
    app.param('userId', users.user);

    app.get('/api/updateCodeName/:codeName', authorization.requiresLogin , users.updateCodeName);

    app.post('/api/addFav', authorization.requiresLogin, users.addFavourite);
    app.post('/api/delFav', authorization.requiresLogin, users.removeFavourite);

    // Setting the oxygen oauth route
    app.get('/auth/oauth', passport.authenticate('oauth', {
        failureRedirect: '/'
    }));
    app.get('/auth/oauth/callback', passport.authenticate('oauth', {
        failureRedirect: '/'
    }), users.authCallback);

    //Setting up the xauth login
    app.post('/xauth',  passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/'
    }));

};
