'use strict';

//Users service used for Users REST endpoint
angular.module('ace.users').factory('UsersAPI', ['$resource', function($resource) {
    return {
		userlist: $resource('/api/users/:userId', {userId: '@_id'}, {update: {method: 'GET'}, query: {method: 'GET'}, getall:{method:'POST', isArray:false}}),
		profile: $resource('api/updateCodeName/:codeName', null, {update:{method:'GET'}}),
        addSchemFav: $resource('api/addSchemFav', null, {save: {method: 'POST', isArray: true}}),
        delSchemFav: $resource('api/delSchemFav', null, {save: {method: 'POST', isArray: true}}),
        updateSchemFav: $resource('api/updateSchemFav', null, {save: {method: 'POST', isArray: true}}),
        getFav: $resource('api/getFav', null, {query: {method: 'GET'}}),
        addFilter: $resource('api/addFilter', null, {save: {method: 'POST', isArray: true}}),
        delFilter: $resource('api/delFilter', null, {save: {method: 'POST', isArray: true}}),
        getFilters: $resource('api/getFilters', null, {query: {method: 'GET'}}),
        addAssociation: $resource('api/addAssociation', null, {save: {method: 'POST', isArray: true}}),
        delAssociation: $resource('api/delAssociation', null, {save: {method: 'POST', isArray: true}}),
        getAssociations: $resource('api/getAssociations', null, {query: {method: 'GET', isArray: true}})
	};
}]);