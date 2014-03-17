'use strict';

angular.module('ace.catalog').controller('catalogController', ['formValidation', '$scope', '$upload', 'Global', function (formValidation, $scope, $upload, Global) {
	$scope.global = Global;
	$scope.formValidator = formValidation;
	$scope.uploadDisabled = true;
	$scope.xls = window.XLS;
	$scope.fileSelect = function($files) {
		var check = $scope.formValidator.checkFileExtension($files[0]?$files[0].name:'', ['xls', 'xlsx']);
		if(check.result)
		{
			$scope.uploadDisabled = false;
			$scope.file = $files[0];
		}
		$scope.success = check.suc_message;
		$scope.valid = check.result;
		$scope.error = check.err_message;
	};

	$scope.populate = function() {
		var reader = new FileReader();
		reader.onload = function(){
			var wb = $scope.xls.read(reader.result, {type: 'binary'});
			var sheet = wb.Sheets.AM;
			console.log(JSON.stringify(sheet));

		};
		reader.readAsBinaryString($scope.file);
	};

}]);