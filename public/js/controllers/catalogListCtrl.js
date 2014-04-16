'use strict';
angular.module('ace.catalog').controller('catalogListCtrl', [
	'$scope',
	'Global',
	'CatalogAPI',
	'$routeParams',
	'_',
	'$modal',
	'$http',
	'$timeout',
	'searchStringParser',
	'SchematicsAPI',
	function ($scope, Global, CatalogAPI, $routeParams, underscore, $modal, $http, $timeout, searchStringParser, SchematicsAPI) {
		$scope.global = Global;
		$scope.fields = [];
		$scope._ = underscore;
		$scope.pageItemLimit = 15;
		$scope.items = [];
		$scope.searchMode = false;
		$scope.lower = 0;
		$scope.upper = $scope.lower + $scope.pageItemLimit;
		$scope.sort = null;
		$scope.defaultFilters = [
			'Catalog',
			'Manufacturer',
			'Assembly Code',
			'Description'
		];
		$scope.filters = [];
		$scope.searchBox = {};
		$scope.searchText = {};
		$scope.typeAheadValues = [];
		$scope.selectedRows = [];
		$scope.selectedItems = [];
		$scope.sth = {show:'aaa'};
		$scope.multiple = false;
		$scope.fields = [];
		$scope.linkedSchematicEntries = {};
		$scope.tooltipHTMLCollection = {};
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
		$scope.authorized = function () {
			if ($scope.global.authenticated && ($scope.global.user.isAdmin || $scope.global.user.isManufacturer))
				return true;
			return false;
		};

		$scope.getLinkedSchematicEntries = function(catalogId) {
			if($scope.global.authenticated && $scope.global.user.associations && $scope.global.user.associations.length > 0)
			{
				var start_string = '<div class="imgLoader">';
				var end_string = '</div>';
				var associations = Global.user.associations;
				for (var i = 0; i < associations.length; i++) {
					if(associations[i].catalogId === catalogId && $scope._.has($scope.linkedSchematicEntries, associations[i].schematicId))
					{
						$scope.tooltipHTMLCollection[catalogId] = start_string + '<img src="'+$scope.linkedSchematicEntries[associations[i].schematicId].thumbnail+'">'+end_string;
					}
				}
			}
		};

		$scope.checkLink = function(data) {
			if(Global.authenticated)
			{
				var associations = Global.user.associations;
				var catalogIds = $scope._.map(associations, function(obj) {return obj.catalogId;});
				if(catalogIds.indexOf(data._id) > -1)
				{
					return true;
				}
				return false;
			}
			else
			{
				return false;
			}
		};

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
				backdrop: 'static',
				resolve: {
					data: function () {
						return {
							filters: $scope.filters,
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

		$scope.isHighlighted = function(index){
			return $scope.selectedRows.indexOf(index) + 1;
		};

		$scope.$watch('selectedItems',function(){
			if($scope.selectedItems.length > 0)
				$scope.searchBox.show = false;
		},true);

		$scope.toggleSelectRow = function(index) {
			//if shift key is not pressed, only one row is selected
			//Otherwise, multiple rows are selected;
			if(!$scope.multiple){
				if($scope.selectedRows.indexOf(index) > -1){
					$scope.selectedRows = [];
					$scope.selectedItems = [];
					return;
				}				
				$scope.selectedRows = [];
				$scope.selectedItems = [];
				
				$scope.selectedRows[0] = index;
				$scope.selectedItems.push($scope.items[index]);
				//console.log(selectedRows.length);
			}else{
				if($scope.selectedRows.indexOf(index) > -1){
					$scope.selectedRows.splice($scope.selectedRows.indexOf(index),1);
					for(var k in $scope.selectedItems){
						if($scope.selectedItems[k]._id === $scope.items[index]._id)
							$scope.selectedItems.splice(k,1);
					}
					return;
				}
				if($scope.selectedRows.length === 0 || $scope.ctrl){
					$scope.selectedRows.push(index);
					$scope.selectedItems.push($scope.items[index]);
					return;
				}
				var minDiff = 9999,
				minIndex = 0;
				for(var j = 0; j < $scope.selectedRows.length; j++){
					if(Math.abs($scope.selectedRows[j] - index) < minDiff){
						minIndex = $scope.selectedRows[j];
						minDiff = Math.abs($scope.selectedRows[j] - index);
					}
				}
				for(var i = 0; i <= Math.abs(index - minIndex);i++){
					if($scope.selectedRows.indexOf(Math.min(index,minIndex)+i)<0){
						$scope.selectedRows.push(Math.min(index,minIndex)+i);
						$scope.selectedItems.push($scope.items[Math.min(index,minIndex)+i]);
					}
				}
			}
		};

		$scope.$watchCollection('global.associations', function() {
			if($scope.global.authenticated && $scope.global.user.associations && $scope.global.user.associations.length > 0)
			{
				SchematicsAPI.getLinks.query({items: $scope._.map($scope.global.user.associations, function(obj) {return obj.schematicId;})}, function(response) {
					if(response)
					{
						for (var i = 0; i < response.length; i++) {
							$scope.linkedSchematicEntries[response[i]._id] = {dl: response[i].dl, thumbnail: response[i].thumbnail};
						}
					}
				});
			}
		});

		$scope.init = function () {
			$scope.showTypes = true;
			$scope.searchBox.show = true;
			$scope.showList = false;
			CatalogAPI.types.query(function (response) {
				if (response)
					$scope.types = response;
			});
			if($scope.global.authenticated && $routeParams.filterName && $scope.global.user.catalogFilters.length !== 0)
			{
				for (var i = 0; i < $scope.global.user.catalogFilters.length; i++) {
					if($scope.global.user.catalogFilters[i].name === $routeParams.filterName)
					{
						$scope.showTypes = false;
						$scope.selected = $scope.global.user.catalogFilters[i].filter.type;
						$scope.searchText = $scope.global.user.catalogFilters[i].filter.search;
						$scope.filters = $scope.global.user.catalogFilters[i].filter.filters;
						$scope.showList = true;
						$scope.search();
						break;
					}
				}
			}
		};

		$scope.addFilter = function (f) {
			for (var i in $scope.filters)
				if ($scope.filters[i].field === f)
					return;
			$scope.filters.push({
				'field': f,
				'value': ''
			});
			$scope.getTypeAheadValues(f);
		};

		$scope.removeFilter = function (f) {
			if ($scope.filters.indexOf(f) !== -1)
				$scope.filters.splice(f, 1);
		};

		$scope.showSearchBox = function () {
			$scope.searchBox.show = true;
		};

		$scope.hideSearchBox = function () {
			$scope.searchBox.show = false;
		};

		$scope.showLinkModal = function(item){
			if(item)
				var linkItem = item;
			$modal.open({
				templateUrl: 'views/Catalog/catIconLinkModal.html',
				controller: 'catIconLinkModalCtrl',
				backdrop: 'static',
				windowClass: 'largerModal',
				resolve:{
					item:function(){return linkItem ? [linkItem]:$scope.selectedItems;}
				}
			});
		};

		$scope.getTypeAheadValues = function (field) {
			if (field === 'Manufacturer') {
				return $http.post('/api/getAllUniqueValues', {
					field: field,
					type: $scope.selected.code
				}).then(function (response) {
					var array = [];
					for (var i = 0; i < response.length; i++) {
						var string = $scope._.values(response[i]).join('');
						array.push(string);
					}
					$scope.typeAheadValues[field] = response.data;
				});
			}
		};

		$scope.showTypeList = function (type) {
			$scope.showList = true;
			$scope.searchBox.show = true;
			$scope.showTypes = false;
			$scope.selectedRows = [];
			$scope.selectedItems = [];
			$scope.target = type;
			$scope.selected = type;
			function parseCamelCase(input) {
				return input.charAt(0).toUpperCase() + input.substr(1).replace(/[A-Z0-9]/g, ' $&');
			}
			$scope.searchText = {};
			$scope.filters = [];
			$scope.searchBox.show = true;
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
			CatalogAPI.fields.query({ type: type.code }, function (response) {
				if (response) {
					for (var i = 0; i < response.length; i++) {
						var field = $scope._.values(response[i]).join('');
						var displayed_field = field;
						if (displayed_field.indexOf('additionalInfo') > -1) {
							displayed_field = displayed_field.replace('additionalInfo.', '');
							displayed_field = displayed_field.replace('_', ' ');
							displayed_field = parseCamelCase(displayed_field);
							$scope.fields.push({
								title: displayed_field,
								field: field,
								sort: null
							});
						}
					}
				}
			});
			$scope.getPage(1, true);
		};

		$scope.processFilters = function (filters) {
			if (!filters)
				return null;
			var newObj = {};
			var non_additional = ['Catalog', 'Manufacturer', 'Assembly Code'];
			for (var i = 0; i < filters.length; i++) {
				var filter = filters[i];
				if(!filter.value)
					continue;
				if(non_additional.indexOf(filter.field) > -1)
					newObj[filter.field[0].toLowerCase()+filter.field.substring(1).replace(' ', '')] = filter.value;
				else
					newObj['additionalInfo.'+filter.field.toLowerCase().replace(' ','')] = filter.value;
			}
			return newObj;
		};

		$scope.closeType = function () {
			$scope.showTypes = false;
		};

		$scope.showType = function () {
			$scope.showTypes = true;
		};

		$scope.toggleField = function (field) {
			if ($scope.cols.indexOf(field) === -1) {
				CatalogAPI.entries.query({
					type: $scope.selected.code,
					lower: $scope.lower,
					sortField: $scope.sort,
					upper: $scope.upper,
					fields: field.field,
					search: $scope.prepareSearchString($scope.searchText.value),
					filters: $scope.processFilters($scope.filters)
				}, function (response) {
					if (response) {
						var data = response.data;
						for (var i = 0; i < $scope.items.length; i++) {
							var newField = $scope._.findWhere(data, { _id: $scope.items[i]._id });
							if (newField && newField.additionalInfo) {
								$scope.items[i][field.field] = newField.additionalInfo[field.field.replace('additionalInfo.', '')];
							} else
								$scope.items[i][field.field] = '';
						}
						$scope.cols.push(field);
					}
				});
			} else {
				$scope.cols.splice($scope.cols.indexOf(field), 1);
			}
		};

		$scope.getPage = function (page, totalFlag) {
			var lower = (page ? page - 1 : 0) * $scope.pageItemLimit;
			var upper = (page ? page : 1) * $scope.pageItemLimit;
			var cols = $scope._.map($scope.cols, function (value) {
					return value.field;
				});
			CatalogAPI.entries.query({
				type: $scope.selected.code,
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
				if (page === 1 && response.data.length === $scope.pageItemLimit ) {
					CatalogAPI.entries.query({
						type: $scope.target.code,
						total: true
					}, function (response) {
						if (response) {
							$scope.total = response.count;
						}
					});
				}else{
					if(page === 1)
						$scope.total = response.data.length;
				}
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
				if(page === 1 && totalFlag)
				{
					if (response.data.length === $scope.pageItemLimit) {
						CatalogAPI.entries.query({
							type: $scope.selected.code,
							search: $scope.prepareSearchString($scope.searchText.value),
							total: true,
							fields: cols.join(' '),
							filters: $scope.processFilters($scope.filters)
						}, function (response) {
							if (response) {
								$scope.total = response.count;
							}
						});
					} else
						$scope.total = response.data.length;
				}
			});
		};

		$scope.prepareSearchString = function (copy) {
			return searchStringParser.parse(copy);
		};

		$scope.search = function () {
			$scope.currentPage = 1;
			$scope.getPage(1, true);
		};

		$scope.sortedValues = function (data) {
			var cols = $scope._.map($scope.cols, function (value) {
					return value.field;
				});
			var val_array = new Array(cols.length + 1).join('-').split('');
			for (var key in data) {
				var index = cols.indexOf(key);
				if (index > -1) {
					if (data[key]) {
						val_array[index] = data[key];
					}
				}
			}
			return val_array;
		};

		$scope.sortTable = function (col) {
			var order = col.sort;
			for (var i = 0; i < $scope.cols.length; i++) {
				$scope.cols[i].sort = null;
			}
			col.sort = order === 1 ? -1 : 1;
			$scope.sort = col;
			$scope.getPage($scope.currentPage ? $scope.currentPage : 1);
		};

		$scope.toggleAll = function () {
			if ($scope.fields.length + 3 !== $scope.cols.length) {
				for (var i = 0; i < $scope.fields.length; i++) {
					var field = $scope.fields[i];
					if ($scope.cols.indexOf(field) === -1)
						$scope.toggleField(field);
				}
				return;
			}
			for (var j = 0; j < $scope.fields.length; j++) {
				var remove_field = $scope.fields[j];
				$scope.cols.splice($scope.cols.indexOf(remove_field), 1);
			}
		};

		$scope.noSubmit = function (evt) {
			if (evt.which === 13)
				evt.preventDefault();
		};

		$scope.checkFilters = function() {
			for (var i = 0; i < $scope.filters.length; i++) {
				if($scope.filters[i].value)
					return true;
			}
			if($scope.searchText.value)
				return true;
			return false;
		};

	}
]);
