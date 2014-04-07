'use strict';

angular.module('ace.catalog').controller('matchFieldsModalCtrl', ['$scope', '$modalInstance', 'sheet', 'CatalogAPI', '_',function($scope, $modalInstance, sheet, CatalogAPI, _){
	$scope.sheet = sheet;
	$scope.doneEnabled = false;
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

	$scope.toggleTrackField = function(field,sheet){
		for(var i in sheet.fields){
			if(sheet.fields[i][0] === field){
				if(sheet.fields[i][2] === true)
					sheet.fields[i].splice(2);
				else
					sheet.fields[i].push(true);
			}
		}
	}

	$scope.$watch('sheet.fields',function(){
		for(var i in $scope.sheet.fields)
			if ($scope.sheet.fields[i][1] === 'error' || $scope.sheet.fields[i][1] === ''){
				$scope.doneEnabled = false;
				return;
			}
		$scope.doneEnabled = true;
	},true);

	$scope.apply = function(){
		$scope.sheet.pendingFields = 0;
		$modalInstance.close($scope.sheet);
	};
	$scope.cancel = function(){
		$modalInstance.dismiss('user cancelled');
	};
}]);