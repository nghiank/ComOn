'use strict';

angular.module('ace.catalog')
.controller('catalogListCtrl', ['$scope', 'Global', 'CatalogAPI','$routeParams', '_', function ($scope, Global, CatalogAPI, $routeParams, underscore) {
	$scope.global = Global;
	$scope.fields = [];
	$scope._ = underscore;
	$scope.pageItemLimit = 15;
	$scope.searchMode = false;
	$scope.lower = 0;
	$scope.upper = $scope.lower + $scope.pageItemLimit;
	$scope.currentPage = 1;
	$scope.authorized = function() {
		if($scope.global.authenticated && ($scope.global.user.isAdmin || $scope.global.user.isManufacturer))
			return true;
		return false;
	};

	$scope.toggleOption = function(type){
		$scope.target = type;
	};

	$scope.init = function() {
		$scope.showTypes = true;
		CatalogAPI.types.query(function(response) {
			if(response)
				$scope.types = response;
		});
		$scope.showList = false;
	};

	$scope.showTypeList = function(type){
		$scope.showList = true;
		$scope.showTypes = false;
		$scope.selected = $scope.target;
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
		CatalogAPI.entries.query({type: type.code, lower: $scope.lower, upper: $scope.upper}, function(response) {
			if(response)
			{
				$scope.items = $scope._.map(response.data, function(value) {return $scope._.omit(value, ['__v']);});
				$scope.total = response.total;
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

	$scope.showType = function(){
		$scope.showTypes = true;
	};

	$scope.toggleField = function(field){
		if($scope.cols.indexOf(field) === -1)
		{
			$scope.cols.push(field);
			CatalogAPI.entries.query({type: $scope.selected.code, lower: $scope.lower, upper: $scope.upper, fields: field.field}, function(response) {
				if(response)
				{
					var data = response.data;
					for (var i = 0; i < $scope.items.length; i++) {
						var newField = $scope._.findWhere(data, {_id: $scope.items[i]._id});
						if(newField && newField.additionalInfo)
						{
							$scope.items[i][field.field] = newField.additionalInfo[field.field.replace('additionalInfo.','')];
						}
						else
							$scope.items[i][field.field] = '';
					}
				}
			});
		}
		else
		{
			$scope.cols.splice($scope.cols.indexOf(field),1);
		}
	};

	$scope.getPage = function(page) {
		var lower = (page? (page-1): 0) * $scope.pageItemLimit;
		var upper = page * $scope.pageItemLimit;
		var cols = $scope._.map($scope.cols, function(value) {return value.field;});
		CatalogAPI.entries.query({type: $scope.selected.code, lower: lower, upper: upper, fields: cols.join(' ')}, function(response) {
			$scope.items = $scope._.map(response.data, function(value) {return $scope._.omit(value, ['additionalInfo', '__v']);});
			if($scope.fields.length > 0)
			{
				for (var i = 0; i < $scope.fields.length; i++) {
					var field = $scope.fields[i];
					for (var j = 0; j < $scope.items.length; j++) {
						var newField = $scope._.findWhere(response.data, {_id: $scope.items[j]._id});
						if(newField && newField.additionalInfo)
							$scope.items[j][field.field] = newField.additionalInfo[field.field.replace('additionalInfo.','')];
						else
							$scope.items[j][field.field] = '';
					}
				}
			}
			$scope.total = response.total;
			$scope.lower = lower;
			$scope.upper = upper;
		});
	};

	$scope.sortedValues = function(data) {
		var cols = $scope._.map($scope.cols, function(value) {return value.field;});
		var val_array = new Array(cols.length+1).join('-').split('');
		for(var key in data)
		{
			var index = cols.indexOf(key);
			if(index > -1)
			{
				if(data[key])
					val_array[index] = data[key];
			}
		}
		return val_array;
	};

	$scope.$watch('currentPage', function() {
		if(!$scope.searchMode && !!$scope.selected)
		{
			$scope.getPage($scope.currentPage);
		}
	});
}]);
