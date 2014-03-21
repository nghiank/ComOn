'use strict';

angular.module('ace.catalog')
.controller('manageCatalogCtrl', ['$scope', 'Global', 'CatalogAPI','$routeParams', '_', function ($scope, Global, CatalogAPI, $routeParams, underscore) {
	$scope.global = Global;
	$scope.fields = [];
	$scope._ = underscore;
	$scope.pageItemLimit = 15;
	$scope.authorized = function() {
		if($scope.global.authenticated && ($scope.global.user.isAdmin || $scope.global.user.isManufacturer))
			return true;
		return false;
	};

	$scope.init = function() {
		$scope.showTypes = true;
		$scope.types = CatalogAPI.types.query(function(){
			$scope.target = $scope.types[0];
		});
		$scope.showList = false;		
	};

	$scope.showTypeList = function(){
		var type = $scope.target;
		function parseCamelCase(input)
		{
			return input.charAt(0).toUpperCase() + input.substr(1).replace(/[A-Z0-9]/g, ' $&');
		}
		CatalogAPI.fields.query({type: type.code}, function(response) {
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
		CatalogAPI.entries.query({type: type.code, manufacturer:Global.user.codeName,lower: 0, upper: $scope.pageItemLimit}, function(response) {
			if(response)
			{ 
				$scope.items = response.data;
			}
		});
		$scope.fields = [];
		$scope.cols = [{title: 'Catalog', field: 'catalog'},{title: 'Manufacturer', field: 'manufacturer'},{title: 'Assembly Code', field: 'assemblyCode'}];
	};

	$scope.toggleType = function(){
		$scope.showTypes = !$scope.showTypes;
	};

	$scope.closeType = function(){
		$scope.showTypes = false;
	};

	$scope.toggleField = function(field){
		if($scope.cols.indexOf(field) === -1)
		{
			$scope.cols.push(field);
			CatalogAPI.entries.query({type: $scope.target.code, manufacturer:Global.user.codeName, lower: 0, upper: $scope.pageItemLimit, fields: field.field}, function(response) {
				console.log(response.data);
				for (var i = 0; i < $scope.items.length; i++) {
					var newField = $scope._.findWhere(response.data, {_id: $scope.items[i]._id});
					if(newField)
						$scope.items[i][field.field] = newField.additionalInfo[field.field.replace('additionalInfo.','')];
					else
						$scope.items[i][field.field] = '';
				}
			});
		}
		else
		{
			$scope.cols.splice($scope.cols.indexOf(field),1);
		}
	};
}]);
