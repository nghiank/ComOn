'use strict';
var config = require('../../../config/config'),
	request = require('request'),
	mongoose = require('mongoose'),
    User = mongoose.model('User');
/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
		if(req.headers.authorization)
		{
			var url = config.base_url + req.url;
			var urlAuth = config.oauth.apiURL + '/api/oauth/v1/ValidateAuthorization';
			var options = {
				url : urlAuth,
				method : 'POST',
				headers: {
					'Content-Type':'application/x-www-form-urlencoded',
				},
				form: {'authorizationHeader': req.headers.authorization,
						'requestUrl': url,
						'httpMethod': req.method,
						'responseFormat': 'json'}
			};
			request(options, function(e, r, body){
				if (body)
				{
					var json = JSON.parse(body);
					if (json && json.TokenValidationResult && json.TokenValidationResult.IsValidAccess === 'true')
					{
						var ret_user = json.TokenValidationResult.User;
				        User.findOne({
				            'email': ret_user.Email
				        }, function(err, user) {
				            if (err) {
				                return res.status(500).render('500', {'error': 'Error Encountered'});
				            }
				            if (!user) {
				                user = new User({
				                    name: ret_user.Profile.FirstName+' '+ret_user.Profile.LastName,
				                    Id: ret_user.Id,
				                    email: ret_user.Email,
				                    provider: 'Autodesk',
				                    lastLogin: new Date(),
				                    isAdmin: false
				                });
				                user.save(function(err) {
				                    if (err) 
				                    	return res.status(500).render('500', {'error': 'Error Encountered'});
				                    next();
				                });
				            } else {
				                    user.lastLogin = new Date();
				                    user.save(function (err) {
				                    if (err)
				                    	return res.status(500).render('500', {'error': 'Error Encountered'});
				                    next();
				                });   
				            }
				        });
					}
				}
				else
				{
					return res.status(500).render('500', {
							error: 'You are not authorizeda to view this page.'
						});
				}
			});
		}
		else
		{
			return res.status(500).render('500', {
					error: 'You are not authorized cto view this page.'
				});
		}
		return;
	}
	next();
};