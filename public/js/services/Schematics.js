'use strict';

//Schematics service used for Schematic REST endpoint
angular.module('ace.schematic').factory('Schematics', ['$resource', function($resource) {

    return {
		standardlist:$resource('api/getSchemStds',
							null,
							{query: {method: 'GET', isArray: true}
		}),
		children:$resource('api/getChildren/:nodeId',
							{nodeId: '@_id'})
	};
}]);