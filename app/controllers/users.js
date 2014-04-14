'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    ComponentSchem = mongoose.model('SchematicComponent'),
    error = require('../utils/error'),
    _ = require('underscore');
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
        updatedProfile.isManufacturer = false;
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
    var count = false, limit = 100, skip = 0;
    if(req.body.count)
        count = req.body.count;
    if(req.body.limit)
        limit = req.body.limit;
    if(req.body.skip)
        skip = req.body.lowerLimit; 

    if(count === true){
        console.log('in Counter');
        User.count({}).exec(function(err, count){
            if(err)
                error.sendGenericError(res, 400, 'Error Encountered');
            res.jsonp({count:count});
        });
    }else{
        User.find({}, {skip:skip}).limit(limit).exec(function(err,users){
            console.log('in no count');
            if(err)
                error.sendGenericError(res, 400, 'Error Encountered');
            res.jsonp({users:users} || null);
        });
    }
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

exports.getFilters = function(req, res) {
    if(!req.user)
        return error.sendUnauthorizedError(res);
    return res.jsonp(req.user.catalogFilters);
};

exports.addFilter = function(req, res) {
    if(!req.user)
        return error.sendUnauthorizedError(res);
    if(!req.body.hasOwnProperty('name') || !req.body.hasOwnProperty('filter'))
        return error.sendGenericError(res, 400, 'Error Encountered');
    var name = req.body.name;
    var list = _.map(req.user.catalogFilters, function(object) {return object.name.toLowerCase();});
    if(list.indexOf(name.toLowerCase()) > -1)
    {
        return error.sendGenericError(res, 400, 'Error Encountered');
    }
    req.user.catalogFilters.push({name: name, filter: req.body.filter});
    req.user.save(function(err) {
        if(err)
            return error.sendGenericError(res, 400, 'Error Encountered');
        res.jsonp(req.user.catalogFilters);
    });
};

exports.removeFilter = function(req,res) {
    if(!req.user)
        return error.sendUnauthorizedError(res);
    if(!req.body.hasOwnProperty('name'))
        return error.sendGenericError(res, 400, 'Error Encountered');
    var name = req.body.name;
    var list = _.map(req.user.catalogFilters, function(object) {return object.name.toLowerCase();});
    if(list.indexOf(name.toLowerCase()) > -1)
    {
        req.user.catalogFilters.splice(list.indexOf(name.toLowerCase()), 1);
        req.user.save(function(err) {
            if(err)
                return error.sendGenericError(res, 400, 'Error Encountered');
            res.jsonp(req.user.catalogFilters);
        });
        return;
    }
    else {
        return error.sendGenericError(res, 400, 'Error Encountered');
    }
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