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
    app.post('/createTestUsers', users.createTestUsers);
    // Setting the oxygen openid route
    app.get('/auth/openid', passport.authenticate('openid', {
        failureRedirect: '/'
    }));
    app.get('/auth/openid/callback', passport.authenticate('openid', {
        failureRedirect: '/'
    }), users.authCallback);

};
