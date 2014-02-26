'use strict';

angular.module('ace.schematic').controller('UploadController', ['$scope','$location', '$upload', 'DatParser', 'Global', '$modal', function ($scope, $location, $upload, ParseDat, Global, $modal) {
	$scope.global = Global;
	$scope.Parser = ParseDat;
	$scope.uploadDisabled = true;
	$scope.httpMethod = 'POST';
	$scope.error = [];
	$scope.success = [];
	$scope.valid = [];
	$scope.abort = function(index) {
		$scope.upload[index].abort();
		$scope.upload[index] = null;
	};
	$scope.hasUploader = function(index) {
		return $scope.upload[index] !== null;
	};
	$scope.datFileSelect = function($files) {
		$scope.error.dat = null;
		var datPattern = new RegExp('^.*\\.dat$');
		$scope.datFileType = datPattern.test($files[0].name);
		if($files[0] && !datPattern.test($files[0].name))
		{
			$scope.error.dat = 'Not a valid data file.';
			return;
		}
		$scope.success.dat = 'A valid data file.';
		$scope.valid.dat = true;
		$scope.datFile = $files[0];
	};

	$scope.resetDAT = function() {
		$scope.uploadDisabled = true;
		$scope.valid.dat = false;
		$scope.error.dat = null;
		$scope.success.dat = null;
		$scope.datFile = null;
		$scope.datProgress = -1 ;
		if ($scope.datUpload) {
			$scope.datUpload.abort();
		}
		$scope.datUpload = null;
		$scope.uploadResult = null;
	};

	$scope.jsonFileSelect = function($files) {
		$scope.error.json = null;
		var jsonPattern = new RegExp('^.*\\.json$');
		if($files[0] && !jsonPattern.test($files[0].name))
		{
			$scope.error.json = 'Not a valid json file.';
			return;
		}
		$scope.success.json = 'A valid json file.';
		$scope.valid.json = true;
		$scope.jsonFile = $files[0];
	};

	$scope.resetJSON = function() {
		$scope.uploadDisabled = true;
		$scope.valid.json = false;
		$scope.error.json = null;
		$scope.success.json = null;
		$scope.jsonFile = null;
		$scope.jsonProgress = -1 ;
		if ($scope.jsonUpload) {
			$scope.jsonUpload.abort();
		}
		$scope.jsonUpload = null;
		$scope.uploadResult = null;
	};

	$scope.checkName = function(){
		$scope.error.name = null;
		$scope.success.name = null;
		$scope.valid.name = false;
		var data = $scope.stdName;
		if(data === '')
		{
			return;
		}
		if(data.length<15 && /^[a-zA-Z0-9]+$/.test(data)) //Later check against all the other standard names too
		{
			$scope.valid.name = true;
			$scope.success.name = 'This is a valid name.';
			$scope.uploadDisabled = true;
			return;
		}
		$scope.uploadDisabled = true;
		$scope.error.name = 'Invalid name.';
	};

	$scope.validate = function() {
		var check = $scope.valid;
		if(check.dat && check.name && check.json)
		{
			$scope.startValidation();
			$scope.uploadFiles();
			return;
		}
		$scope.uploadDisabled = true;
	};


	$scope.uploadFiles = function() {
		$scope.datProgress = 0;
		$scope.datUpload = $upload.upload({
			url : 'api/upload',
			method: $scope.httpMethod,
			headers: {'Content-Type': 'application/file'},
			data : {
				stdName : $scope.stdName
			},
			file: [$scope.datFile , $scope.jsonFile],
			fileFormDataName: ['datFile', 'jsonFile']
		}).then(function(response) {
			if(response.status !== 200)
			{
				window.alert('Error encountered');
				return;
			}
			$scope.uploadResult = response.data;
		}, null, function(evt) {
			$scope.datProgress = parseInt(100.0 * evt.loaded / evt.total);
		});
	};
	
	$scope.startValidation = function() {
		console.log($scope.uploadResult);
		console.log('Got Here');
		var modalInstance = $modal.open({
			templateUrl: 'views/validationModal.html',
			controller: 'ValidationController',
		});
		modalInstance.result.then(function(valid){
			$scope.uploadDisabled = !valid;
		});
	};


}]);

angular.module('ace.schematic').controller('ValidationController', function($scope,$modal, $modalInstance){
	$scope.valid = true;
	$scope.ok = function(){
		console.log('OK!');
		$modalInstance.close($scope.valid);
	};
	$scope.cancel = function(){
		console.log('Cancel!');
		$modalInstance.dismiss('Cancel');
	};
});