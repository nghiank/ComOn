'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    ComponentSchem = mongoose.model('SchematicComponent'),
    error = require('../utils/error');

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
                return error.sendGenericError(res, 400, 'Error Encountered');
            }
            else
            {
                res.redirect('/');
            }
        });
        return;
    }
    return error.sendGenericError(res, 400, 'Error Encountered');
};

/**
 * Update Profile
 */
exports.updateCodeName = function(req, res) {
    if(req.user)
    {
        var updatedProfile = req.user;
        updatedProfile.codeName = req.params.codeName;
        updatedProfile.save(function(err) {
            if(err)
            {
                return error.sendGenericError(res, 400, 'Error Encountered');
            }
            else
            {
                res.jsonp(updatedProfile);
            }
        });
        return;
    }
    return error.sendGenericError(res, 400, 'Error Encountered');
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
 * Change User Status
 */
exports.changeStatus = function(req,res) {
    var user = req.profile;
    if(!user.codeName)
        return error.sendGenericError(res, 400, 'Error Encountered');
    user.isManufacturer = !user.isManufacturer;
    user.save(function(err) {
        if (err) {
            return error.sendGenericError(res, 400, 'Error Encountered');
        } else {
            res.jsonp(user);
        }
    });
};

/**
 * Change User Schematic Favourites
 */
exports.addSchemFavourite = function(req, res) {
    if(!req.user)
        return error.sendUnauthorizedError(res);
    if(!req.body.hasOwnProperty('_id'))
        return error.sendGenericError(res, 400, 'Error Encountered');
    var id = req.body._id;
    ComponentSchem.findOne({_id: id}, function(err, component) {
        if(err)
            return error.sendGenericError(res, 400, 'Error Encountered');
        if(!component)
            return error.sendGenericError(res, 400, 'Error Encountered');
        var list = req.user.SchemFav;
        if(list.indexOf(id) < 0)
        {
            list.push(id);
            req.user.SchemFav = list;
            req.user.save(function(err) {
                if(err)
                    return error.sendGenericError(res, 400, 'Error Encountered');
                res.jsonp(list);
            });
            return;
        }
        res.jsonp(list);
    });
};

exports.removeSchemFavourite = function(req,res) {
    if(!req.user)
        return error.sendUnauthorizedError(res);
    if(!req.body.hasOwnProperty('_id'))
        return error.sendGenericError(res, 400, 'Error Encountered');
    var id = req.body._id;
    var list = req.user.SchemFav;
    if(list.indexOf(id) > -1)
    {
        req.user.SchemFav.remove(id);
        req.user.save(function(err) {
            if(err)
                return error.sendGenericError(res, 400, 'Error Encountered');
            res.jsonp(req.user.SchemFav);
        });
        return;
    }
    res.jsonp(list);
};

exports.getFavourites = function(req, res) {
    if(!req.user)
        return error.sendUnauthorizedError(res);
    ComponentSchem.find({_id: {$in: req.user.SchemFav}, isComposite: false}).exec(function(err, components) {
        if(err)
            return error.sendGenericError(res, 400, 'Error Encountered');
        res.jsonp({'schematic': components});
    });
};


/**
 * Find user by Id
 */
exports.user = function(req,res,next,id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to find User ' + id));
            req.profile = user;
            next();
        });
};

/**
 * Find user by name
 */
exports.findByName = function(req, res, next, name) {
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