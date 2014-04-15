'use strict';

//Schematics service used for Schematic REST endpoint
angular.module('ace.schematic').factory('SchematicsAPI', ['$resource','$http', function($resource,$http) {
    return {
		standardlist: $resource('api/getSchemStds', null, {query: {method: 'GET', isArray: true}, find: {method: 'GET', isArray: false}}),
		children: $resource('api/getChildren/:nodeId', {nodeId: '@_id'}),
		node:$resource('api/getNode/:nodeId', {nodeId:'@_id'}),
		createNode:$resource('api/createNode',null),
		delete: $resource('api/delete/:nodeId', {nodeId: '@_id'}),
		editComponent: $resource('api/editComponent',null),
		editStd: $resource('api/editStd',null),
		checkId:$resource('api/isUniqueId',null),
		getAllChildren:$resource('api/getEntireStandard',null, {save: {method: 'POST', isArray: true}}),
		nodeByName:function(query, std){
			console.log(query);
			return $http.post('api/getNodeByName', 
			{
				name: query,
				standard:std
			}
			).then(function(res){
				var result = [];
				console.log(res);
				angular.forEach(res.data, function(entry){
					result.push(entry);
				});
				return result;
			});
		}
	};
}]);