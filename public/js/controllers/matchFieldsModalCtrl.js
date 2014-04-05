'use strict';

angular.module('ace.catalog').controller('matchFieldsModalCtrl', ['$scope', '$modalInstance', 'sheet', 'CatalogAPI', '_',function($scope, $modalInstance, sheet, CatalogAPI, _){
	$scope.sheet = sheet;
	$scope.init = function(){
		$scope.std_fields = [];
		CatalogAPI.fields.query({type:sheet.dName},function(response){
			angular.forEach(response,function(field){
				var processedField = _.values(field).join('');
				processedField = processedField.indexOf('additionalInfo.') > -1 ? processedField.substr(15) : processedField;
				$scope.std_fields.push(processedField);
			});
		});
	};

	$scope.sortedFields = function(field){
		var weight = field[1] === '' ? 0 : 1;
		return weight + field[0];
	};


	$scope.checkUniqueMatch = function(field){
		for(var i = 0; i < sheet.fields.length; i ++)
			if(field[1] === sheet.fields[i][1] && field[0] !== sheet.fields[i][0]){
				field[1] = 'error';
				return;
			}

	};


	$scope.apply = function(){
		$modalInstance.close(true);
	};
	$scope.cancel = function(){
		$modalInstance.close(false);
	};
}]);