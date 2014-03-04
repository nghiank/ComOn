'use strict';

angular.module('ace.schematic')
.controller('editCompFormCtrl', ['$timeout', '$scope','$location', '$upload', 'DatParser', 'Global', '$http', 'Schematics', '$modalInstance','target',function ($timeout, $scope, $location, $upload, ParseDat, Global, $http, Schematics, $modalInstance, target) {
	$scope.target = {'_id':target._id};
	$scope.origin = target;
	$scope.global = Global;
	$scope.httpMethod = 'POST';
	$scope.error = {};
	$scope.success = {};
	$scope.id = null;
	$scope.valid = {'name':false,'thumbnail':false,'dl':false};
	$scope.editDisabled = true;

	$scope.$watchCollection('valid',function(){
		var nameCorrect = (($scope.target.name && $scope.valid.name) || typeof $scope.target.name ==='undefined');
		var thumbnailCorrect = (($scope.valid.thumbnail && $scope.target.thumbnail) || typeof $scope.target.thumbnail === 'undefined');
		var dlCorrect = (($scope.target.dl && $scope.valid.dl) || typeof $scope.target.dl === 'undefined');
		console.log(nameCorrect,thumbnailCorrect,dlCorrect);
		var cleanForm = typeof $scope.target.name === 'undefined' && typeof $scope.target.dl === 'undefined' && typeof $scope.target.thumbnail === 'undefined';
		$scope.editDisabled = !(nameCorrect && thumbnailCorrect && dlCorrect) || cleanForm;
	});

	$scope.abort = function(index) {
		$scope.upload[index].abort();
		$scope.upload[index] = null;
	};

	$scope.hasUploader = function(index) {
		return $scope.upload[index] !== null;
	};

	$scope.validateThumbnail = function(){
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

	$scope.validateDwg = function(){
		console.log('in validateDwg');
		if($scope.target.dl){
			console.log('in if');
			$http.get($scope.target.dl)
			.success(function(){
				$scope.valid.dl = true;
				console.log('dl link valid');
			})
			.error(function(){
				$scope.valid.dl = false;
				$scope.error.dl = 'The dl link is broken.';
				console.log($scope.error.dl);
			});
		}
	};

	$scope.checkName = function(){
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
					if($scope.target.name.localeCompare(comps.children[i].name) === 0 && $scope.target._id !== comps.children[i]._id){
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

	$scope.delete = function() {
		if(!$scope.target._id)
			return;
		Schematics.delete.get({nodeId: $scope.target._id}, function(response) {
			if(response)
			{
				console.log('Deleted!');
				$modalInstance.dismiss('Delete done.');
			}
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