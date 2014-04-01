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
    
    app.post('/api/updateCatalog', authorization.requiresLogin , hasAuthorization, catalog.populateCatalog);
    app.post('/api/getTypeFields', catalog.getAllFields);
    app.post('/api/getEntries', catalog.getCatalogEntries);
    app.get('/api/getTypes', catalog.getAllTypes);

};