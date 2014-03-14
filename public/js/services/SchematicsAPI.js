'use strict';

//Schematics service used for Schematic REST endpoint
angular.module('ace.schematic').factory('SchematicsAPI', ['$resource', function($resource) {
    return {
		standardlist: $resource('api/getSchemStds', null, {query: {method: 'GET', isArray: true}, find: {method: 'GET', isArray: false}}),
		children: $resource('api/getChildren/:nodeId', {nodeId: '@_id'}),
		node:$resource('api/getNode/:nodeId', {nodeId:'@_id'}),
		createNode:$resource('api/createNode',null),
		nodeVersion:$resource('/api/getCompVersions',null),
		delete: $resource('api/delete/:nodeId', {nodeId: '@_id'}),
		editComponent: $resource('api/editComponent',null),
		editStd: $resource('api/editStd',null),
		checkId:$resource('api/isUniqueId',null),
		publish:$resource('api/publishComponent',null),
	};
}]);