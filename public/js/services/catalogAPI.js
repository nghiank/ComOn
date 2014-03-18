'use strict';

//Schematics service used for Schematic REST endpoint
angular.module('ace.catalog').factory('CatalogAPI', ['$resource', function($resource) {
    return {
			updateCatalog: $resource('api/updateCatalog',null),
			entries: $resource('api/getEntries', null, {query: {method: 'POST', isArray: true}})
		};
}]);