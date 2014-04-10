'use strict';

angular.module('ace.catalog').controller(
	'manageCatalogCtrl', ['$scope', 'Global', 'CatalogAPI', '_' ,'$modal', 'searchStringParser', function ($scope, Global, CatalogAPI, underscore, $modal, searchStringParser) {
		$scope.global = Global;
		$scope.fields = [];
		$scope._ = underscore;
		$scope.pageItemLimit = 15;
		$scope.searchMode = false;
		$scope.lower = 0;
		$scope.upper = $scope.lower + $scope.pageItemLimit;
		$scope.sort = null;
		$scope.sort = null;
		$scope.defaultFilters = [
			'Catalog',
			'Assembly Code',
			'Description'
		];
		$scope.filters = [];
		$scope.searchText = {};
		$scope.typeAheadValues = [];
		$scope.fields = [];
		$scope.cols = [
			{
				title: 'Catalog',
				field: 'catalog',
				sort: null
			},
			{
				title: 'Manufacturer',
				field: 'manufacturer',
				sort: null
			},
			{
				title: 'Assembly Code',
				field: 'assemblyCode',
				sort: null
			}
		];

		$scope.authorized = function() {
			if($scope.global.authenticated && ($scope.global.user.isAdmin || $scope.global.user.isManufacturer))
				return true;
			return false;
		};
		$scope.manufacturer = $scope.authorized()?($scope.global.user.isAdmin?null:$scope.global.user.codeName):null;

		$scope.showConfigureModal = function () {
			$modal.open({
				templateUrl: 'views/Catalog/configureTableModal.html',
				controller: 'configureTableModalCtrl',
				resolve: {
					data: function () {
						return {
							fields: $scope.fields,
							cols: $scope.cols,
							toggleField: $scope.toggleField,
							toggleAll: $scope.toggleAll
						};
					}
				}
			});
		};

		$scope.showFilterModal = function () {
			var modalInstance = $modal.open({
				templateUrl: 'views/Catalog/filterModal.html',
				controller: 'filterModalCtrl',
				resolve: {
					data: function () {
						return {
							filters: $scope.filters,
							type: $scope.selected,
							search: $scope.searchText
						};
					}
				}
			});
			modalInstance.result.then(function(result){
				if(result)
				{
					console.log(result);
				}
			});
		};

		$scope.init = function() {
			$scope.showTypes = true;
			CatalogAPI.types.query(function(response){
				if(response) {
					$scope.types =  response;
					$scope.target = $scope.types.length? $scope.types[0]: null;
				}
			});
			$scope.showList = false;
		};

		$scope.addFilter = function (f) {
			for (var i in $scope.filters)
				if ($scope.filters[i].field === f)
					return;
			$scope.filters.push({
				'field': f,
				'value': ''
			});
		};

		$scope.removeFilter = function (f) {
			if ($scope.filters.indexOf(f) !== -1)
				$scope.filters.splice(f, 1);
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
			$scope.fields = [];
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
			$scope.currentPage = 1;
			var lower = 0;
			var upper = $scope.pageItemLimit;
			var cols = $scope._.map($scope.cols, function (value) {
					return value.field;
				});
			CatalogAPI.entries.query({
				type: $scope.target.code,
				manufacturer: $scope.manufacturer,
				lower: lower,
				sortField: $scope.sort,
				upper: upper,
				fields: cols.join(' '),
				search: $scope.prepareSearchString($scope.searchText.value),
				filters: $scope.processFilters($scope.filters)
			}, function (response) {
				$scope.items = $scope._.map(response.data, function (value) {
					return $scope._.omit(value, [
						'additionalInfo',
						'__v'
					]);
				});
				if ($scope.fields.length > 0) {
					for (var i = 0; i < $scope.fields.length; i++) {
						var field = $scope.fields[i];
						for (var j = 0; j < $scope.items.length; j++) {
							var newField = $scope._.findWhere(response.data, { _id: $scope.items[j]._id });
							if (newField && newField.additionalInfo)
								$scope.items[j][field.field] = newField.additionalInfo[field.field.replace('additionalInfo.', '')];
							else
								$scope.items[j][field.field] = '';
						}
					}
				}
				$scope.lower = lower;
				$scope.upper = upper;
				if (response.data.length === $scope.pageItemLimit) {
					CatalogAPI.entries.query({
						type: $scope.target.code,
						search: $scope.prepareSearchString($scope.searchText.value),
						total: true,
						manufacturer: $scope.manufacturer,
						fields: cols.join(' '),
						filters: $scope.processFilters($scope.filters)
					}, function (response) {
						if (response) {
							$scope.total = response.count;
						}
					});
				} else
					$scope.total = response.data.length;
			});
			$scope.cols = [{title: 'Catalog', field: 'catalog', sort: null},{title: 'Manufacturer', field: 'manufacturer', sort: null},{title: 'Assembly Code', field: 'assemblyCode', sort: null}];
		};


		$scope.processFilters = function (filters) {
			if (!filters)
				return null;
			var newObj = {};
			for (var i = 0; i < filters.length; i++) {
				var filter = filters[i];
				newObj[filter.field.toLowerCase()] = filter.value;
			}
			return newObj;
		};

		$scope.toggleField = function(field){
			if($scope.cols.indexOf(field) === -1)
			{
				CatalogAPI.entries.query({
					type: $scope.target.code,
					lower: $scope.lower,
					sortField: $scope.sort,
					upper: $scope.upper,
					fields: field.field,
					manufacturer: $scope.manufacturer,
					search: $scope.prepareSearchString($scope.searchText.value),
					filters: $scope.processFilters($scope.filters)
				}, function(response) {
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

		$scope.getPage = function (page) {
			var lower = (page ? page - 1 : 0) * $scope.pageItemLimit;
			var upper = (page ? page : 1) * $scope.pageItemLimit;
			var cols = $scope._.map($scope.cols, function (value) {
					return value.field;
				});
			CatalogAPI.entries.query({
				type: $scope.target.code,
				lower: lower,
				sortField: $scope.sort,
				upper: upper,
				fields: cols.join(' '),
				manufacturer: $scope.manufacturer,
				search: $scope.prepareSearchString($scope.searchText.value),
				filters: $scope.processFilters($scope.filters)
			}, function (response) {
				$scope.items = $scope._.map(response.data, function (value) {
					return $scope._.omit(value, [
						'additionalInfo',
						'__v'
					]);
				});
				if ($scope.fields.length > 0) {
					for (var i = 0; i < $scope.fields.length; i++) {
						var field = $scope.fields[i];
						for (var j = 0; j < $scope.items.length; j++) {
							var newField = $scope._.findWhere(response.data, { _id: $scope.items[j]._id });
							if (newField && newField.additionalInfo)
								$scope.items[j][field.field] = newField.additionalInfo[field.field.replace('additionalInfo.', '')];
							else
								$scope.items[j][field.field] = '';
						}
					}
				}
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

		$scope.prepareSearchString = function (copy) {
			return searchStringParser.parse(copy);
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
