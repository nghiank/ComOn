'use strict';

angular.module('ace.catalog')
.controller('catalogListCtrl', ['$scope', 'CatalogAPI','$routeParams', 'Global', 'breadcrumbs', '$modal', 'UsersAPI', function ($scope, CatalogAPI, $routeParams, Global, breadcrumbs, $modal, UsersAPI) {
	$scope.breadcrumbs = breadcrumbs;
	$scope.Global = Global;
	$scope.admin = false;
	if($scope.Global.authenticated && $scope.Global.user.isAdmin)
		$scope.admin = true;

	$scope.fields = ['Description','Misc1','Misc2','weblink'];
	$scope.items = [{'Catalog':'ABCD-1234','Manufacturer':'AB','Description':'STH,ANYTHING','Assembly Code':'ABCList'},
	{'Catalog':'ABCD-1254','Manufacturer':'SIEMENS','Description':'ANYTHING','Assembly Code':'ABCList','weblink':'www.siemens.com'}];
	$scope.cols = ['Catalog','Manufacturer','Assembly Code'];

	$scope.toggleField = function(field){
		if($scope.cols.indexOf(field) === -1)
			$scope.cols.push(field);
		else
			$scope.cols.splice($scope.cols.indexOf(field),1);
		console.log($scope.cols.indexOf(field));
	};

	$scope.toggleOption = function (child) {
		return (child.showOption = !child.showOption);
	};

	$scope.seperate = function() {
		$scope.leaves = [];
		$scope.subtypes = [];
		var children = $scope.children;
		for (var i = children.length - 1; i >= 0; i--) {
			if(children[i].isComposite)
				$scope.subtypes.push(children[i]);
			else
				$scope.leaves.push(children[i]);
		}
		if($scope.Global.authenticated)
			$scope.addFavouriteKey();
	};

	$scope.showEditForm  = function(child){
		$scope.target = child;
		var modalInstance = $modal.open({
			templateUrl: 'views/Schematics/editComponentForm.html',
			controller: 'editCompFormCtrl',
			backdrop: 'static',
			resolve: {
				target: function() {
					return ($scope.target);
				}
			}
		});
		modalInstance.result.then(function(){
			$scope.getChildren();
		});
	};

	

	$scope.showComingSoon = function(){
		$modal.open({
			templateUrl: 'views/ComingModal.html',
			controller: 'ComingModalCtrl'
		});
	};

	$scope.addFavouriteKey = function() {
		var listOfFavs = $scope.Global.user.SchemFav;
		for (var i = 0; i < $scope.leaves.length; i++) {
			var leaf = $scope.leaves[i];
			if(listOfFavs.indexOf(leaf._id) > -1)
				leaf.isFavourite = true;
			else
				leaf.isFavourite = false;
		}
	};

	$scope.addFav = function(child){
		if(child.isComposite)
			return;
		UsersAPI.addSchemFav.save({_id: child._id}, function(response) {
			if(response)
			{
				console.log('favourite added');
				child.isFavourite = true;
				if($scope.Global.authenticated)
					$scope.Global.setFav(response);
			}
		});
	};

	$scope.delFav = function(child){
		if(child.isComposite)
			return;
		UsersAPI.delSchemFav.save({_id: child._id}, function(response) {
			if(response)
			{
				console.log('favourite deleted');
				child.isFavourite = false;
				if($scope.Global.authenticated)
					$scope.Global.setFav(response);
			}

		});
	};

	$scope.unpublished = function(child) {
		return child.isPublished || $scope.admin;
	};

}]);
