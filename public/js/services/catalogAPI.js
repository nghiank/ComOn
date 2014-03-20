'use strict';

//Schematics service used for Schematic REST endpoint
angular.module('ace.catalog').factory('CatalogAPI', ['$resource', function($resource) {
    return {
			updateCatalog: $resource('api/updateCatalog',null),
			entries: $resource('api/getEntries', null, {query: {method: 'POST'}}),
			types: $resource('api/getTypes', null, {query:{method:'GET', isArray:true}}),
			fields: $resource('api/getTypeFields', null, {query:{method:'POST', isArray:true}})
		};
}]);