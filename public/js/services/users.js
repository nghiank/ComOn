'use strict';

//Articles service used for articles REST endpoint
angular.module('ace.users').factory('Users', ['$resource', function($resource) {

    return {
		userlist:$resource('api/users/:userId',
							{userId: '@_id'},
							{update: {method: 'GET'}},  {query: {method: 'GET'}
		}),
		profile:$resource('api/updateCodeName/:codeName',
                                    null,
                                    {update:{method:'GET'}})
	};
}]);