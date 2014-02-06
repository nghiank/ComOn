'use strict';

//Articles service used for articles REST endpoint
angular.module('ace.users').factory('Users', ['$resource', function($resource) {
    return $resource('users/:action/:userId', {
		userId: '@_id',
		action: '@action'
	},  {
		update: {
			method: 'PUT'
		}
	},  {
		query: {
			method: 'GET'
		}
	});
}]);