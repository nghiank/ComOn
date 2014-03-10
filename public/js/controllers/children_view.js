'use strict';

angular.module('ace.schematic')
.controller('Children', ['$scope', 'Schematics', '$routeParams', 'Global', 'breadcrumbs', '$modal', 'Users', function ($scope, Schematics, $routeParams, Global, breadcrumbs, $modal, Users) {
	$scope.breadcrumbs = breadcrumbs;
	$scope.Global = Global;
	$scope.admin = false;
	if($scope.Global.authenticated && $scope.Global.user.isAdmin)
		$scope.admin = true;
	$scope.getChildren = function() {
		var nodeId = $routeParams.nodeId;
		$scope.nodeId = nodeId;
		if(!nodeId)
			return;
		Schematics.children.get({nodeId: nodeId}, function(children) {
			$scope.children = children.children;
			$scope.seperate();
		});
		breadcrumbs.fetch.get({nodeId: nodeId}, function(result) {
			var hiearchy = result.parentHiearchy;
			for (var i = hiearchy.length - 1; i >= 0; i--) {
				hiearchy[i].link = '#!/standards/' + hiearchy[i].link;
			}
			breadcrumbs.add(hiearchy);
		});
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

	$scope.showLeafAddForm = function(){
		Schematics.node.get({nodeId:$routeParams.nodeId}, function(node){
			$scope.target = node;
			var modalInstance = $modal.open({
				templateUrl: 'views/Schematics/addCompForm.html',
				controller: 'addCompFormCtrl',
				backdrop: 'static',
				resolve:{
					parent: function(){
						return ($scope.target);
					}
				}
			});
			modalInstance.result.then(function(){
				$scope.getChildren();
			});
		});
	};

	$scope.showSubtypeAddForm = function(){
		Schematics.node.get({nodeId:$routeParams.nodeId}, function(node){
			$scope.target = node;
			var modalInstance = $modal.open({
				templateUrl: 'views/Schematics/addGrpForm.html',
				controller: 'addGrpFormCtrl',
				backdrop: 'static',
				resolve:{
					parent: function(){
						return ($scope.target);
					}
				}
			});
			modalInstance.result.then(function(){
				$scope.getChildren();
			});
		});
	};

	$scope.showSubtypeEditForm = function(child){
		$scope.target = child;
		var modalInstance = $modal.open({
			templateUrl: 'views/Schematics/editGrpForm.html',
			controller: 'editGrpFormCtrl',
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
		Users.addSchemFav.save({_id: child._id}, function(response) {
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
		Users.delSchemFav.save({_id: child._id}, function(response) {
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
