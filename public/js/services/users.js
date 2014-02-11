'use strict';

//Articles service used for articles REST endpoint
angular.module('ace.users').factory('Users', ['$resource', function($resource) {
    return $resource('users/:userId', {
		userId: '@_id'
	},  {
		update: {
			method: 'GET'
		}
	},  {
		query: {
			method: 'GET'
		}
	});
}]);