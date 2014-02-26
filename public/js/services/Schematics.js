'use strict';

//Schematics service used for Schematic REST endpoint
angular.module('ace.users').factory('Schematic', ['$resource', function($resource) {

    return {
		standardlist:$resource('api/getSchemStds',
							{query: {method: 'GET'}
		})
	};
}]);