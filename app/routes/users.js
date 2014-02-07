'use strict';

// User routes use users controller
var users = require('../controllers/users');
var authorization = require('./middlewares/authorization');

var hasAuthorization = function(req, res, next) {
    if (req.user.isAdmin === false) {
        return res.status(500).render('500', {
            error: 'You are not authorized to view this page.',
            user: req.user ? JSON.stringify(req.user) : 'null'
        });
    }
    next();
};

module.exports = function(app, passport) {

    app.get('/signout', users.signout);
    app.get('/users/me', authorization.requiresLogin , users.me);
    app.get('/users', authorization.requiresLogin , hasAuthorization, users.all);
    app.get('/makeAdmin/:name', users.makeAdmin);
    app.param('name', users.user);

    app.get('/users/:userId', authorization.requiresLogin, hasAuthorization, users.changeStatus);
    app.param('userId', users.findById);

    // Setting the oxygen openid route
    app.get('/auth/openid', passport.authenticate('openid', {
        failureRedirect: '/'
    }));
    app.get('/auth/openid/callback', passport.authenticate('openid', {
        failureRedirect: '/'
    }), users.authCallback);

    // Setting the oxygen oauth route
    app.get('/auth/oauth', passport.authenticate('oauth', {
        failureRedirect: '/'
    }));
    app.get('/auth/oauth/callback', passport.authenticate('oauth', {
        failureRedirect: '/'
    }), users.authCallback);

    app.post('/xauth',  passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/'
    }));

};
