'use strict';

exports.sendGenericError = function(res, status)
{
	return res.status(status).jsonp({'error': 'You are not authorized to view this page.'});
};