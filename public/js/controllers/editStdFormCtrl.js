'use strict';

angular.module('ace.schematic').controller('editStdFormCtrl', ['$timeout', '$scope','$location', '$upload', 'DatParser', 'Global', '$modal', 'Schematics',function ($timeout, $scope, $location, $upload, ParseDat, Global, $modal, Schematics) {
	$scope.global = Global;
	$scope.Parser = new ParseDat();
	$scope.httpMethod = 'POST';
	$scope.error = {};
	$scope.success = {};
	$scope.valid = {'name':false,'json':false,'dat':false,'validation':false};
	$scope.id = null;
	$scope.uploadDisabled = true;

	$scope.$watchCollection('[valid.name,desc,valid.validation]',function(){
		$scope.editNameDescOnly = !$scope.valid.dat && ((!$scope.stdName && $scope.desc) || $scope.stdName && $scope.valid.name);
		$scope.editDatFile = $scope.valid.name && $scope.valid.json && $scope.valid.dat && $scope.valid.validation;
		$scope.uploadDisabled = !($scope.editNameDescOnly || $scope.editDatFile);
	});

	$scope.$watch('currentStd.name', function() {
		$scope.error = {};
		$scope.success = {};
		$scope.valid = {'name':false,'json':false,'dat':false,'validation':false};
		$scope.id = null;
		$scope.uploadDisabled = true;
		$scope.datObject = null;
		$scope.json = null;
		$scope.datFile = null;
		$scope.jsonFile = null;
		$scope.editStdForm.$setPristine();
	});

	$scope.abort = function(index) {
		$scope.upload[index].abort();
		$scope.upload[index] = null;
	};
	$scope.hasUploader = function(index) {
		return $scope.upload[index] !== null;
	};

	$scope.datFileSelect = function($files) {
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
		if(!data)
		{
			return;
		}
		if(data.length > 30) //Later check against all the other standard names too
		{
			$scope.error.name = 'Invalid name.';
			return;
		}

		Schematics.standardlist.query(function(stds) {
			if(stds){
				console.log(stds);
				for (var i = 0; i < stds.length; i++){
					var dbName = stds[i].name.toUpperCase();
					var localName = $scope.stdName.toUpperCase();
					if(dbName.localeCompare(localName) === 0 && $scope.$parent.currentStd._id.localeCompare(stds[i]._id) !== 0){
						console.log('wrong name');
						$scope.valid.name = false;
						$scope.error.name = 'This name already exists in database';
						return;
					}
				}
			}
			$scope.valid.name = true;
			$scope.success.name = 'This is a valid name.';
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
				$scope.valid.validation = valid;
			});
		}
		$scope.valid.validation = false;
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
				$scope.uploadResult = response.data;
				console.log('Uploaded!');
				$timeout($scope.getAll, 500);
			}
		}, null, function(evt) {
			$scope.datProgress = parseInt(100.0 * evt.loaded / evt.total);
		});
	};


	$scope.editStd = function(){
		if($scope.editNameDescOnly)
			Schematics.editStd.save({standardId:$scope.currentStd.standard._id, stdName:$scope.stdName, desc: $scope.desc}, function(response){
				if(response)
				{
					console.log('standard updated!');
					$timeout($scope.getAll,500);
					$scope.currentStd.name = $scope.stdName;
				}
			});
		if($scope.editDatFile){
			Schematics.delete.get({nodeId: $scope.currentStd._id}, function(response){
				if(response){
					console.log('deleted & re-uploading');
					$scope.uploadFiles();
				}
			});
		}
	};

	$scope.delete = function() {
		var modalInstance = $modal.open({
			templateUrl: 'views/Schematics/DeleteModal.html',
			controller:'DeleteModalCtrl',
			backdrop: 'static',
		});
		modalInstance.result.then(function(result){
			if(result){
				if(!$scope.currentStd._id)
					return;
				Schematics.delete.get({nodeId: $scope.currentStd._id}, function(response) {
					if(response)
					{
						console.log('Deleted!');
						$timeout($scope.getAll, 500);
					}
				});
			}
		});
	};

	$scope.populateDesc = function() {
		return $scope.currentStd.standard.description? $scope.currentStd.standard.description: 'No description available.';
	};

	$scope.parseDatForStdName = function(){
		var reader = new FileReader();
		reader.onload = function(){
			$scope.Parser.parse(reader.result);
			$scope.Parser.generateSubMenuHierachy();
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
