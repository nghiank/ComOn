'use strict';
var authorization = require('./middlewares/authorization');
var error = require('../utils/error');
var catalog = require('../controllers/catalog');
var hasAuthorization = function(req, res, next) {
    if (!req.user || (req.user && (req.user.isAdmin || req.user.isManufacturer)  === false)) {
        return error.sendUnauthorizedError(res);
    }
    next();
};

module.exports = function(app) {
    
    app.post('/api/uploadCatalog', authorization.requiresLogin , hasAuthorization, catalog.populateCatalog);

};