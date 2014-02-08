'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User');

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
    res.redirect('/');
};

/**
 * Logout
 */
exports.signout = function(req, res) {
    if(req.user)
    {
        var user = req.user;
        user.lastLogout = new Date();
        user.save(function(err) {
            if(err) console.log(err);
        });
    }
    req.logout();
    res.redirect('/');
};


/**
 * Session
 */
exports.session = function(req, res) {
    res.redirect('/');
};


/**
 * Send User
 */
exports.me = function(req, res) {
    res.jsonp(req.user || null);
};


/**
 * Make Admin
 */
exports.makeAdmin = function(req, res) {
    if(req.profile)
    {
        var admin = req.profile;
        admin.isAdmin = true;
        admin.save(function(err) {
            if(err)
            {
                res.status(500).render('500', {
                    error: 'User not found.'
                });
            }
            else
            {
                res.redirect('/');
            }
        });
    }
    else
    {
        res.status(500).render('500', {
            error: 'User not found.'
        });
    }
};

/**
 * Update Profile
 */
exports.updateCodeName = function(req, res) {
    if(req.profile)
    {
        var updatedProfile = req.profile;
        updatedProfile.isManufacturer = !updatedProfile.isManufacturer;
        updatedProfile.save(function(err) {
            if(err)
            {
                res.status(500).render('500', {
                    error: 'User not found.'
                });
            }
            else
            {
                res.redirect('/');
            }
        });
    }
    else
    {
        res.status(500).render('500', {
            error: 'User not found.'
        });
    }
};

/**
 * Send All Users
 */
exports.all = function(req, res) {
    User.find({}, function (err, users) {
        res.jsonp(users || null);
    });
};

/**
 * Create Test user
 */
exports.createTestUsers = function(req, res, next) {
    var user = new User(req.body);
    user.save(function(err) {
        if(err) return next(err);
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.redirect('/');
        });
    });
};


/**
 * Find user by name
 */
exports.user = function(req, res, next, name) {
    User
        .findOne({
            name: name
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to find User ' + name));
            req.profile = user;
            next();
        });
};