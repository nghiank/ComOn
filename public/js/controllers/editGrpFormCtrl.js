'use strict';

angular.module('ace.schematic')
.controller('editGrpFormCtrl', ['$timeout', '$scope','$location', '$upload', 'DatParser', 'Global', '$http', 'Schematics', '$modalInstance', '$modal', 'target', function ($timeout, $scope, $location, $upload, ParseDat, Global, $http, Schematics, $modalInstance, $modal, target) {
	$scope.target = {'_id':target._id};
	$scope.origin = target;
	$scope.global = Global;
	$scope.httpMethod = 'POST';
	$scope.error = {};
	$scope.success = {};
	$scope.id = null;
	$scope.valid = {'name':false,'thumbnail':false,'dl':false,'id':false};
	$scope.editDisabled = true;

	$scope.imgPreview = '<img src="'.concat($scope.origin.thumbnail, '"/>');

	$scope.$watch('target.thumbnail',function(){
		if($scope.target.thumbnail){
			$scope.imgPreview = '<img src="'.concat($scope.target.thumbnail, '"/>');
		}else{
			$scope.imgPreview = '<img src="'.concat($scope.origin.thumbnail, '"/>');
		}
	});

	$scope.$watchCollection('valid',function(){
		var nameCorrect = (($scope.target.name && $scope.valid.name) || typeof $scope.target.name ==='undefined');
		var idCorrect = ($scope.target.id && $scope.valid.id) || typeof $scope.target.id === 'undefined';
		var thumbnailCorrect = (($scope.valid.thumbnail && $scope.target.thumbnail) || typeof $scope.target.thumbnail === 'undefined');
		console.log(nameCorrect,thumbnailCorrect);
		var cleanForm = typeof $scope.target.name === 'undefined' && typeof $scope.target.thumbnail === 'undefined' && typeof $scope.target.id === 'undefined';
		$scope.editDisabled = !(idCorrect && nameCorrect && thumbnailCorrect) || cleanForm;
	});

	$scope.abort = function(index) {
		$scope.upload[index].abort();
		$scope.upload[index] = null;
	};

	$scope.hasUploader = function(index) {
		return $scope.upload[index] !== null;
	};

	$scope.validateThumbnail = function(){
		console.log($scope.target.thumbnail);
		$scope.valid.thumbnail = false;
		$scope.error.thumbnail = null;
		if($scope.target.thumbnail)
			$http.get($scope.target.thumbnail)
			.success(function(){
				$scope.valid.thumbnail = true;
				console.log('thumbnail link valid');
			})
			.error(function(){
				$scope.valid.thumbnail = false;
				$scope.error.thumbnail = 'The link is broken.';
				console.log('thumbnail link broken');
			});
	};

	$scope.checkName = function(){
		console.log($scope.origin.parentNode);
		$scope.error.name = null;
		$scope.success.name = null;
		$scope.valid.name = false;
		if(!$scope.target.name)
		{
			return;
		}
		if($scope.target.name.length > 30) //Later check against all the other standard names too
		{
			$scope.error.name = 'Invalid name.';
			$scope.$apply();
			return;
		}

		Schematics.children.get({nodeId:$scope.origin.parentNode._id}, function(comps) {
			if(comps){
				for (var i = 0; i < comps.children.length; i++){
					var dbName = comps.children[i].name.toUpperCase();
					var localName = $scope.target.name.toUpperCase();
					if(dbName.localeCompare(localName) === 0 && $scope.target._id !== comps.children[i]._id){
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

	$scope.checkId = function(){
		$scope.error.id = null;
		$scope.success.id = null;
		if(!$scope.target.id)
			return;
		if($scope.target.id === $scope.origin.id){
			$scope.valid.id = true;
			return;
		}
		$scope.target.id = $scope.target.id.toUpperCase();
		Schematics.checkId.save({id:$scope.target.id, standardId:$scope.origin.standard._id},function(response){
			if(response.unique === true){
				$scope.valid.id = true;
			}
			else{
				$scope.valid.id = false;
				$scope.error.id = 'This id already exists in the database.';
			}
		});
	};

	$scope.delete = function() {
		$scope.hide = true;
		var modalInstance = $modal.open({
			templateUrl: 'views/Schematics/DeleteModal.html',
			controller:'DeleteModalCtrl',
			backdrop: 'static',
		});
		modalInstance.result.then(function(decision){
			if(decision){
				if(!$scope.target._id)
					return;
				Schematics.delete.get({nodeId: $scope.target._id}, function(response) {
					if(response)
					{
						console.log('Deleted!');
						$modalInstance.close();
					}
				});
			}
			$scope.hide = false;
		});
	};

	$scope.editComp = function(){
		Schematics.editComponent.save({node:$scope.target}, function(response){
			if(response)
			{
				console.log('Edit Success!');
				$modalInstance.close();
			}
		});
	};

	$scope.cancel = function(){
		$modalInstance.dismiss('Cancelled by User');
	};

}]);