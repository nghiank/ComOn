'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    ComponentSchem = mongoose.model('SchematicComponent'),
    SchematicVersions = mongoose.model('Schematic__versions'),
    CatSchem = mongoose.model('Catalog'),
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
    var filterCriteria = {};
    var hint = null;
    if(req.body.showMan) {
        filterCriteria.isManufacturer = true;
        hint = {isManufacturer: 1};
    }    
    if(req.body.showUsers) {
        filterCriteria.isAdmin = true;
        hint = {isAdmin: 1};
    }
    if(req.body.search)
    {
        filterCriteria.name = new RegExp(req.body.search.trim(), 'i');
        hint = {name: 1};
    }
    if(count === true){
        User.count(filterCriteria).exec(function(err, count){
            if(err)
                error.sendGenericError(res, 400, 'Error Encountered');
            res.jsonp({count:count});
        });
    }
    else{
        var query = User.find(filterCriteria).skip(skip).sort('name').limit(limit).lean();
        if(hint)
            query = query.hint(hint);
        query.exec(function(err,users){
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
        return error.sendGenericError(res, 400, 'Invalid Parameters');
    var id = req.body._id;
    ComponentSchem.findOne({_id: id}, function(err, component) {
        if(err)
            return error.sendGenericError(res, 401, 'Error Encountered');
        if(!component)
            return error.sendGenericError(res, 402, 'Error Encountered');
        if(component.published === 0)
            return error.sendGenericError(res, 403, 'Error Encountered');
        var list = req.user.SchemFav;
        if(list.indexOf(id) < 0)
        {
            list.push(id);
            req.user.SchemFav = list;
            req.user.save(function(err) {
                if(err)
                    return error.sendGenericError(res, 404, 'Error Encountered');
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
        return error.sendGenericError(res, 400, 'Invalid Parameters');
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
    ComponentSchem.find({_id: {$in: req.user.SchemFav}, isComposite: false}).lean().exec(function(err, components) {
        if(err)
            return error.sendGenericError(res, 400, 'Error Encountered');
        if(!components || components.length === 0)
            return res.jsonp({'schematic': components});
        var checked = 0;
        var getVersion = function(i)
        {
            SchematicVersions.findOne({refId: components[i]._id}).exec(function(err, version) {
                if(err)
                    console.log(err);
                else if(!version)
                    console.log('No available version');
                else
                {
                    var published = (components[i].published)? (components[i].published - 1): 0;
                    var published_version = JSON.parse(JSON.stringify(version.versions[published]));
                    var omit = ['refVersion', 'version', 'published', 'standard', 'parentNode', '_id', '__v'];
                    published_version = _.omit(published_version, omit);
                    _.extend(components[i], published_version);
                }
                if(++checked === components.length)
                {
                    res.jsonp({'schematic': components});
                }
            });
            return;
        };
        for (var i = components.length - 1; i >= 0; i--) {
            getVersion(i);
        }
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
        return error.sendGenericError(res, 400, 'Invalid Parameters');
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
        return error.sendGenericError(res, 400, 'Invalid Parameters');
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


exports.getAssociations = function(req, res) {
    if(!req.user)
        return error.sendUnauthorizedError(res);
    return res.jsonp(req.user.associations);
};

exports.addAssociation = function(req, res) {
    if(!req.user)
        return error.sendUnauthorizedError(res);
    if(!req.body.hasOwnProperty('items') || !req.body.hasOwnProperty('_id'))
        return error.sendGenericError(res, 400, 'Invalid Parameters');
    var items = req.body.items;
    if(items.length === 0)
        return error.sendGenericError(res, 400, 'Error Encountered');
    var _id = req.body._id;
    var entry;
    var checker = function(obj) {
        if(entry && JSON.stringify(obj.catalogId) === JSON.stringify(entry._id) && JSON.stringify(obj.schematicId) === JSON.stringify(_id))
        {
            return true;
        }
        return false;
    };
    ComponentSchem.findOne({_id: _id}).lean().exec(function(err, component) {
        if(err)
            return error.sendGenericError(res, 400, 'Error Encountered');
        if(!component)
            return error.sendGenericError(res, 400, 'Error Encountered');
        CatSchem.find({_id: {$in: items}}).lean().exec(function(err, entries) {
            if(err)
                return error.sendGenericError(res, 400, 'Error Encountered');
            var associations = req.user.associations;
            for (var i = 0; i < entries.length; i++) {
                entry = entries[i];
                if(!associations || (associations && _.filter(associations, checker).length === 0))
                {
                    associations.push({catalogId: entry._id, schematicId: _id});
                }
            }
            req.user.associations = associations;
            req.user.save(function(err) {
                if(err)
                    return error.sendGenericError(res, 400, 'Error Encountered');
                else
                    res.jsonp(req.user.associations);
            });
        });
    });
};

exports.removeAssociation = function(req,res) {
    if(!req.user)
        return error.sendUnauthorizedError(res);
    if(!req.body.hasOwnProperty('item') || !req.body.hasOwnProperty('_id'))
        return error.sendGenericError(res, 400, 'Invalid Parameters');
    var item = JSON.stringify(req.body.item);
    var _id = JSON.stringify(req.body._id);
    var list = req.user.associations;
    var callback = function(err) {
        if(err)
            return error.sendGenericError(res, 400, 'Error Encountered');
        res.jsonp(req.user.associations);
    };
    for (var i = 0; i < list.length; i++) {
        if(JSON.stringify(list[i].catalogId) === item && JSON.stringify(list[i].schematicId)=== _id)
        {
            req.user.associations.splice(i, 1);
            req.user.save(callback);
            return;
        }
    }
    return error.sendGenericError(res, 400, 'Error Encountered');
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