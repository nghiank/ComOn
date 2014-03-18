'use strict';

//Users service used for Users REST endpoint
angular.module('ace.users').factory('Users', ['$resource', function($resource) {

    return {
		userlist: $resource('api/users/:userId', {userId: '@_id'}, {update: {method: 'GET'}},  {query: {method: 'GET'}}),
		profile: $resource('api/updateCodeName/:codeName', null, {update:{method:'GET'}}),
        addSchemFav: $resource('api/addSchemFav', null, {save: {method: 'POST', isArray: true}}),
        delSchemFav: $resource('api/delSchemFav', null, {save: {method: 'POST', isArray: true}}),
        getFav: $resource('api/getFav', null, {query: {method: 'GET'}})
	};
}]);