'use strict';
var config = require('../../../config/config'),
request = require('request'),
mongoose = require('mongoose'),
User = mongoose.model('User'),
error = require('../../utils/error');


/**
 * Generic require login routing middleware
 */

var validatingAuthorizationHeader = function(req,res,next)
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
		if (!body)
		{
			return error.sendGenericError(res,401);
		}

		var json = JSON.parse(body);
		if (json && json.TokenValidationResult && json.TokenValidationResult.IsValidAccess === 'true')
		{
			var ret_user = json.TokenValidationResult.User;

			//Finding/creating new User
			User.findOne({
				'email': ret_user.Email
			}, function(err, user) {
				if (err) {
					return error.sendGenericError(res,401);
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
							return error.sendGenericError(res,401);
						return next();
					});
				} else {
					user.lastLogin = new Date();
					user.save(function (err) {
						if (err)
							return error.sendGenericError(res,401);
						return next();
					});
				}
			});

		}
	});
};

exports.requiresLogin = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	if(!req.headers.authorization)
	{
		return error.sendGenericError(res,401);
	}
	return validatingAuthorizationHeader(req,res,next);
};