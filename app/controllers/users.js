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
                res.render('error', {
                    status: 500
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
        res.render('error', {
            status: 500
        });
    }
};


/**
 * Send All Users
 */
exports.all = function(req, res) {
    var userMap = {};
    User.find({}, function (err, users) {
        users.forEach(function(user) {
            userMap[user._id] = user;
        });
        res.jsonp(userMap || null);
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