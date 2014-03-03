'use strict';

//Schematics service used for Schematic REST endpoint
angular.module('ace.schematic').factory('Schematics', ['$resource', function($resource) {

    return {
		standardlist:$resource('api/getSchemStds',
							null,
							{query: {method: 'GET', isArray: true},
							find:{method: 'GET', isArray: false}
		}),
		children:$resource('api/getChildren/:nodeId',
							{nodeId: '@_id'
		}),
		delete:$resource('api/delete/:nodeId',
							{nodeId: '@_id'
		}),
		editStd:$resource('api/editStd/:nodeId',{name:'@_id'}
		)
	};
}]);