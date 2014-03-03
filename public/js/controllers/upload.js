'use strict';

angular.module('ace.schematic').controller('UploadController', ['$timeout', '$scope', '$location', '$upload', 'DatParser', 'Global', '$modal', 'Schematics', function ($timeout, $scope, $location, $upload, ParseDat, Global, $modal, Schematics) {
	$scope.global = Global;
	$scope.Parser = new ParseDat();
	$scope.uploadDisabled = true;
	$scope.validateDisabled = true;
	$scope.httpMethod = 'POST';
	$scope.error = [];
	$scope.success = [];
	$scope.valid = [];
	$scope.desc = '';

	$scope.abort = function(index) {
		$scope.upload[index].abort();
		$scope.upload[index] = null;
	};
	$scope.hasUploader = function(index) {
		return $scope.upload[index] !== null;
	};

	$scope.datFileSelect = function($files) {
		$scope.resetDAT();
		$scope.checkDatFile($files);
		$scope.parseDatForStdName();
	};

	$scope.checkDatFile = function($files){
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
		$scope.resetJSON();
		$scope.uploadDisabled = true;
		$scope.validateDisabled = true;
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
		$scope.stdName = null;
		$scope.valid.name = false;
		$scope.error.name = null;
		$scope.success.name = null;
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
		$scope.parseJsonFile();
	};

	$scope.resetJSON = function() {
		$scope.uploadDisabled = true;
		$scope.validateDisabled = true;
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
		if(data.length > 30) //Later check against all the other standard names too
		{
			$scope.uploadDisabled = true;
			$scope.error.name = 'Invalid name.';
			$scope.$apply();
			return;
		}

		Schematics.standardlist.query(function(stds) {
			if(stds){
				for (var i = 0; i < stds.length; i++){
					if($scope.stdName.localeCompare(stds[i].name) === 0){
						$scope.valid.name = false;
						$scope.error.name = 'This name already exists in database';
						return;
					}
				}
			}
			$scope.valid.name = true;
			$scope.success.name = 'This is a valid name.';
			$scope.uploadDisabled = true;
		});

		
	};

	$scope.validate = function() {
		var check = $scope.valid;
		if(check.dat && check.name && check.json)
		{
			var modalInstance = $modal.open({
				templateUrl: 'views/Schematics/validationModal.html',
				controller: 'ValidationController',
				backdrop: 'static',
				resolve: {
					items: function() {
						return ({'dat': $scope.datObject, 'json': $scope.jsonText});
					}
				}
			});
			modalInstance.result.then(function(valid){
				$scope.uploadDisabled = !valid;
			});
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
				stdName : $scope.stdName,
				description: $scope.desc
			},
			file: [$scope.datFile , $scope.jsonFile],
			fileFormDataName: ['datFile', 'jsonFile']
		}).then(function(response) {
			if(response)
			{
				if(response.status === 200)
				{
					$scope.uploadResult = response.data;
					console.log('Uploaded!');
					$timeout($scope.getAll, 500);
				}
			}
		}, null, function(evt) {
			$scope.datProgress = parseInt(100.0 * evt.loaded / evt.total);
		});
	};
	
	$scope.parseDatForStdName = function(){
		var reader = new FileReader();
		reader.onload = function(){
			$scope.Parser.parse(reader.result);
			$scope.Parser.generateSubMenuHierachy();
			//MO is the node for the name of the standard.
			$scope.stdName = $scope.Parser.rootNode.title;
			$scope.datObject = $scope.Parser.rootNode;
			$scope.checkName();
		};
		reader.readAsText($scope.datFile);
	};

	$scope.parseJsonFile = function(){
		var reader = new FileReader();
		reader.onload = function(){
			$scope.jsonText = reader.result;
		};
		reader.readAsText($scope.jsonFile);
	};

}]);

angular.module('ace.schematic').controller('ValidationController', ['$scope', '$timeout', '$modalInstance', 'ValidationService', 'items',function($scope, $timeout, $modalInstance, ValidationService, items){
	$scope.validator = ValidationService;
	$scope.valid = false;
	$scope.startValidation = function() {
		$scope.validator.validateLinks(items.dat, items.json);
		$scope.messages = $scope.validator.messages();
	};
	$scope.init = function() {
		$timeout($scope.startValidation, 3000);
	};
	$scope.valid = false;
	$scope.ok = function(){
		$scope.valid = $scope.validator.result();
		$modalInstance.close($scope.valid);
	};
	$scope.cancel = function(){
		$modalInstance.dismiss('Cancelled by User');
	};
}]);