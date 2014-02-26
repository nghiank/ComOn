'use strict';

//service used for schematics REST endpoint
angular.module('ace.schematic').factory('Schematics', ['$resource', function($resource) {
	return {
			getSchematicStds:$resource('/api/getSchemStds',
				null,
				{query:{method:'GET', isArray:true}}
			)
		};
}]);