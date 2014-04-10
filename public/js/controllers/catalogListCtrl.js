'use strict';

angular.module('ace.catalog').controller('catalogListCtrl', [
	'$scope',
	'Global',
	'CatalogAPI',
	'$routeParams',
	'_',
	'$modal',
	'$http',
	function ($scope, Global, CatalogAPI, $routeParams, underscore, $modal, $http) {
		$scope.global = Global;
		$scope.fields = [];
		$scope._ = underscore;
		$scope.pageItemLimit = 15;
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
		$scope.showDownload = (window.exec === undefined)? false : true;
		$scope.authorized = function () {
			if ($scope.global.authenticated && ($scope.global.user.isAdmin || $scope.global.user.isManufacturer))
				return true;
			return false;
		};
		$scope.toggleOption = function (type) {
			$scope.target = type;
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
					//Call API
				}
			});
		};

		$scope.init = function () {
			$scope.showTypes = true;
			$scope.searchBox.show = true;
			CatalogAPI.types.query(function (response) {
				if (response)
					$scope.types = response;
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
			$scope.showTypes = false;
			$scope.selected = $scope.target;
			function parseCamelCase(input) {
				return input.charAt(0).toUpperCase() + input.substr(1).replace(/[A-Z0-9]/g, ' $&');
			}
			$scope.searchText = {};
			$scope.filters = [];
			$scope.searchBox = true;
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
			CatalogAPI.entries.query({
				type: type.code,
				lower: $scope.lower,
				upper: $scope.upper
			}, function (response) {
				if (response) {
					$scope.items = $scope._.map(response.data, function (value) {
						return $scope._.omit(value, ['__v']);
					});
					if (response.data.length === $scope.pageItemLimit) {
						CatalogAPI.entries.query({
							type: type.code,
							total: true
						}, function (response) {
							if (response) {
								$scope.total = response.count;
							}
						});
					} else
						$scope.total = response.data.length;
				}
			});
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
		$scope.getPage = function(page, callback) {
			var lower;
			var upper;
			var cols = [];
			if (callback) {
				lower = 0;
				upper = 5000;
				$scope.cols.forEach(function(entry){
					cols.push(entry.field);
				});
				$scope.fields.forEach(function(entry){
					cols.push(entry.field);
				});
			} else {
				lower = ( page ? (page - 1) : 0) * $scope.pageItemLimit;
				upper = page * $scope.pageItemLimit;
				cols = $scope._.map($scope.cols, function(value) {
					return value.field;
				});
			}

			CatalogAPI.entries.query({
				type : $scope.selected.code,
				lower : lower,
				sortField : $scope.sort,
				upper : upper,
				fields : cols.join(' ')
			}, function(response) {
				var queryResult = $scope._.map(response.data, function(value) {
					return $scope._.omit(value, ['additionalInfo', '__v']);
				});
				if ($scope.fields.length > 0) {
					for (var i = 0; i < $scope.fields.length; i++) {
						var field = $scope.fields[i];
						for (var j = 0; j < queryResult.length; j++) {
							var newField = $scope._.findWhere(response.data, {
								_id : queryResult[j]._id
							});
							if (newField && newField.additionalInfo){
								if (callback){
									queryResult[j][field.field.replace('additionalInfo.', '')] = newField.additionalInfo[field.field.replace('additionalInfo.', '')];
								}
								else
									queryResult[j][field.field] = newField.additionalInfo[field.field.replace('additionalInfo.', '')];
							}
							else
								queryResult[j][field.field] = '';
						}
					}
				}
				if (callback) {
					callback($scope.selected.code, queryResult);
				} else {
					$scope.items = queryResult;
					$scope.lower = lower;
					$scope.upper = upper;
				}
			});
		};
		$scope.prepareSearchString = function (copy) {
			function escapeRegExp(un_string) {
				return un_string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
			}
			if (!copy)
				return '';
			var string = escapeRegExp(copy);
			var exact = [];
			var words = [];
			var or = [];
			var orExps = [];
			var temp = [];
			function gatherExacts() {
				var reg = /".+?"/g;
				var match;
				do {
					match = reg.exec(string);
					if (match) {
						exact.push(string.substring(match.index + 1, match.index + match[0].length - 1));
						temp.push(string.substring(match.index, match.index + match[0].length));
					}
				} while (match);
			}
			function gatherOR() {
				function getLeft(orExpStartIndx) {
					var opLeft = string.substring(0, orExpStartIndx).trim();
					var opLeftLen = opLeft.length;
					if (opLeft[opLeftLen - 1] === '"')
						// This is a quoted expression, potentially
					{
						opLeftLen -= 1;
						// We are indexing...
						while (--opLeftLen >= 0) {
							if (opLeft[opLeftLen] === '"' && (opLeftLen === 0 || opLeft[opLeftLen - 1] === ' ')) {
								opLeft = opLeft.substring(opLeftLen);
								break;
							}
						}
					}
					else {
						// Normal, non-exact operand
						// Locate the previous character such that it starts the word -
						// i.e., the one preceding it is a space
						while (--opLeftLen >= -1) {
							if (opLeftLen === -1 || opLeft[opLeftLen] === ' ') {
								opLeft = opLeft.substring(opLeftLen + 1);
								break;
							}
						}
					}
					return opLeft;
				}
				function getRight(orExpStartIndx) {
					var opRight = string.substring(orExpStartIndx + 4).trim();
					var opRightLen = 0;
					if (opRight[0] === '"')
						// Start of a quoted exact phrase
					{
						// Locate the next " character such that it starts the word -
						// i.e., the one following it is a space (or none)
						while (++opRightLen <= opRight.length) {
							if (opRight[opRightLen] === '"' && (opRightLen === opRight.Length - 1 || opRight[opRightLen + 1] === ' ')) {
								opRight = opRight.substring(0, opRightLen + 1);
								break;
							}
						}
					}
					else {
						// Normal, non-exact operand
						// Locate the next character such that it ends the word -
						// i.e., the one following it is a space (or none)
						while (++opRightLen <= opRight.length) {
							if (opRight.Length === opRightLen || opRight[opRightLen] === ' ') {
								opRight = opRight.substring(0, opRightLen);
								break;
							}
						}
					}
					return opRight;
				}
				var index = string.indexOf(' OR ');
				while (index > -1) {
					var opLeft = getLeft(index);
					var opRight = getRight(index);
					temp.push(opLeft);
					temp.push(opRight);
					or.push(opLeft.trim());
					or.push(opRight.trim());
					var offset = string.indexOf(opRight, index + 4);
					index = string.indexOf(' OR ', offset);
				}
			}
			function groupOR() {
				for (var i = 0; i < or.length; i += 2) {
					if (0 !== i && or[i - 1] === or[i]) {
						orExps[orExps.length - 1].push(or[i + 1]);
					} else {
						var newSet = [];
						newSet.push(or[i]);
						newSet.push(or[i + 1]);
						orExps.push(newSet);
					}
				}
			}
			function cleanSearchString() {
				// Remove all OR operator strings
				string = string.replace(/ OR /gi, '').trim();
				// Sort such that longer strings are in front and replaced first,
				// to avoid replacement of shorter substrings hosing things
				temp = $scope._.sortBy(temp, function (val) {
					return val ? val.length : 0;
				});
				// Remove all exact and OR operands identified
				for (var i = 0; i < temp.length; i++) {
					string = string.replace(new RegExp(temp[i], 'ig'), ' ');
				}
				temp = [];
			}
			function removeDuplicates() {
				for (var exp in or) {
					if (exact.indexOf(or[exp]) > -1)
						exact.splice(exact.indexOf(or[exp]), 1);
				}
			}
			function gatherRemainingWords() {
				cleanSearchString();
				words = [];
				var s_words = string.split(' ');
				for (var i = 0; i < s_words.length; i++) {
					var tword = s_words[i].trim();
					if (tword.length > 0) {
						words.push(tword);
					}
				}
			}
			function filterExtraOrExps() {
				for (var i = 0; i < orExps.length; i++) {
					var exp = orExps[i];
					for (var j = 0; j < words.length; j++) {
						if (exp.indexOf(words[j]) > -1) {
							orExps.splice(i, 1);
							break;
						}
					}
				}
			}
			gatherExacts();
			gatherOR();
			groupOR();
			removeDuplicates();
			gatherRemainingWords();
			filterExtraOrExps();
			return {
				words: words,
				exacts: exact,
				or: orExps,
				string: escapeRegExp(copy)
			};
		};
		$scope.search = function () {
			$scope.currentPage = 1;
			var lower = 0;
			var upper = $scope.pageItemLimit;
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
			});
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

		var resultDownloaded = function(type, queryResult) {
			console.log(queryResult);
			try{
				if (window.exec !== undefined){
					var response = window.exec(JSON.stringify({ functionName: 'MergeTable', invokeAsCommand: false, functionParams: {'type' : type, 'result' : queryResult}}));
					console.log(response);
				}
			}
			catch(e){
				console.error(e);
			}
		};

		$scope.downloadSearchResults = function() {
			alert('downloading...');
			$scope.getPage(0, resultDownloaded);
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
