'use strict';

/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(500).render('500', {
                error: 'Please login to view this page.'
            });
    }
    next();
};