'use strict';

angular.module('ace.catalog')
.controller('manageCatalogCtrl', ['$scope', 'Global', 'CatalogAPI', '_','$modal', function ($scope, Global, CatalogAPI, underscore, $modal) {
	$scope.global = Global;
	$scope.fields = [];
	$scope._ = underscore;
	$scope.pageItemLimit = 15;
	$scope.searchMode = false;
	$scope.lower = 0;
	$scope.upper = $scope.lower + $scope.pageItemLimit;
	$scope.sort = null;
	
	$scope.authorized = function() {
		if($scope.global.authenticated && ($scope.global.user.isAdmin || $scope.global.user.isManufacturer))
			return true;
		return false;
	};
	$scope.manufacturer = $scope.authorized()?($scope.global.user.isAdmin?null:$scope.global.user.codeName):null;
	$scope.init = function() {
		$scope.showTypes = true;
		$scope.types = CatalogAPI.types.query(function(){
			$scope.target = $scope.types[0];
		});
		$scope.showList = false;
	};

	$scope.showTypeList = function(){
		var type = $scope.target;
		if (!type) {return;}
		$scope.showList = true;
		$scope.showTypes = false;
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
						$scope.fields.push({title: displayed_field, field: field, sort: null});
					}
				}
			}
		});
		CatalogAPI.entries.query({type: type.code, manufacturer: $scope.manufacturer, lower: $scope.lower, upper: $scope.upper}, function(response) {
			if(response)
			{
				$scope.items = $scope._.map(response.data, function(value) {return $scope._.omit(value, ['__v']);});
				$scope.total = response.total;
			}
		});
		$scope.fields = [];
		$scope.cols = [{title: 'Catalog', field: 'catalog', sort: null},{title: 'Manufacturer', field: 'manufacturer', sort: null},{title: 'Assembly Code', field: 'assemblyCode', sort: null}];
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
			CatalogAPI.entries.query({type: $scope.target.code, manufacturer: $scope.manufacturer ,lower: $scope.lower, sortField: $scope.sort, upper: $scope.upper, fields: field.field}, function(response) {
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
					$scope.cols.push(field);
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
		CatalogAPI.entries.query({type: $scope.target.code, lower: lower, sortField: $scope.sort, upper: upper, fields: cols.join(' ')}, function(response) {
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
				{
					val_array[index] = data[key];
				}
			}
		}
		return val_array;
	};

	$scope.toggleAll = function() {
		if(($scope.fields.length+3) !== $scope.cols.length)
		{
			for (var i = 0; i < $scope.fields.length; i++) {
				var field = $scope.fields[i];
				if($scope.cols.indexOf(field) === -1)
					$scope.toggleField(field);
			}
			return;
		}
		for (var j = 0; j < $scope.fields.length; j++) {
			var remove_field = $scope.fields[j];
			$scope.cols.splice($scope.cols.indexOf(remove_field),1);
		}
	};
	
	$scope.sortTable = function(col) {
		var order = col.sort;
		for (var i = 0; i < $scope.cols.length; i++) {
			$scope.cols[i].sort = null;
		}
		col.sort = (order === 1)? -1: 1;
		$scope.sort = col;
		$scope.getPage($scope.currentPage? $scope.currentPage: 1);
	};

	$scope.showComingModal = function(){
		$modal.open({
			templateUrl: 'views/ComingModal.html',
			controller: 'ComingModalCtrl',
		});
	};

	$scope.showEditItemModal = function(item){
		var modalInstance = $modal.open({
			templateUrl: 'views/Catalog/editItemForm.html',
			controller: 'editItemFormCtrl',
			resolve:{
				item: function() {
					return (item);
				}
			}
		});
		modalInstance.result.then(function(){
			$scope.showTypeList();
		});
	};
}]);
