'use strict';
var authorization = require('./middlewares/authorization');
var error = require('../utils/error');
var schem = require('../controllers/schematics');
var hasAuthorization = function(req, res, next) {
    if (req.user.isAdmin === false) {
        return error.sendUnauthorizedError(res);
    }
    next();
};

module.exports = function(app) {
    
    app.post('/api/upload', authorization.requiresLogin , hasAuthorization, schem.receiveFiles);

    app.get('/api/getChildren/:nodeId', schem.getNodeChildren);
    app.get('/api/getParentHiearchy/:nodeId', schem.getParentHiearchy);
    app.param('nodeId', schem.node);

    app.get('/api/getSchemStds', schem.getAllSchemStds);
    app.get('/api/findSchemStd', schem.findSchemStd);
};