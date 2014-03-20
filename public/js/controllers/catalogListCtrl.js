'use strict';

angular.module('ace.catalog')
.controller('catalogListCtrl', ['$scope', 'Global', 'CatalogAPI','$routeParams', '_', function ($scope, Global, CatalogAPI, $routeParams, underscore) {
	$scope.global = Global;
	$scope.fields = [];
	$scope._ = underscore;
	$scope.authorized = function() {
		if($scope.global.authenticated && ($scope.global.user.isAdmin || $scope.global.user.isManufacturer))
			return true;
		return false;
	};

	$scope.breadcrumbs = [{'title':'Catalog','link':'#!/catalog'}];

	$scope.init = function() {
		function parseCamelCase(input)
		{
			return input.charAt(0).toUpperCase() + input.substr(1).replace(/[A-Z0-9]/g, ' $&');
		}
		CatalogAPI.fields.query({type: $routeParams.type}, function(response) {
			if(response)
			{
				for (var i = 0; i < response.length; i++) {
					var field = $scope._.values(response[i]).join('');
					var displayed_field = field;
					if(displayed_field.indexOf('additionalInfo') > -1)
					{
						displayed_field = displayed_field.replace('additionalInfo.', '');
						displayed_field = displayed_field.replace('_', ' ');
						displayed_field = parseCamelCase(displayed_field);
						$scope.fields.push({title: displayed_field, field: field});
					}
				}
			}
		});
		CatalogAPI.entries.query({type: $routeParams.type, lower: 0, upper: 10}, function(response) {
			if(response)
			{
				$scope.items = response.data;
			}
		});
		$scope.breadcrumbs.push({'title':$routeParams.type,'link':'#'});
	};
	$scope.cols = [{title: 'Catalog', field: 'catalog'},{title: 'Manufacturer', field: 'manufacturer'},{title: 'Assembly Code', field: 'assemblyCode'}];
	$scope.toggleField = function(field){
		if($scope.cols.indexOf(field) === -1)
		{
			$scope.cols.push(field);
			CatalogAPI.entries.query({type: $routeParams.type, lower: 0, upper: 10, fields: field.field}, function(response) {
				for (var i = 0; i < $scope.items.length; i++) {
					var newField = $scope._.findWhere(response.data, {_id: $scope.items[i]._id});
					$scope.items[i][field.field] = newField.additionalInfo[field.field.replace('additionalInfo.','')];
				}
			});
		}
		else
		{
			$scope.cols.splice($scope.cols.indexOf(field),1);
		}
	};
}]);
