'use strict';

/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.render('500', {
                error: 'Please login to view this page.'
            });
    }
    next();
};