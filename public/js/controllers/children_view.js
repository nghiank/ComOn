'use strict';

angular.module('ace.schematic')
.controller('Children', ['$scope', 'Schematics', '$routeParams', 'Global', 'breadcrumbs', '$modal', function ($scope, Schematics, $routeParams, Global, breadcrumbs, $modal) {
	$scope.breadcrumbs = breadcrumbs;
	$scope.admin = false;
	if(Global.user && Global.user.isAdmin)
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
		$scope.showComingSoon();
	};

	$scope.showSubtypeAddForm = function(){
		$scope.showComingSoon();
	};

	$scope.showSubtypeEditForm = function(){
		$scope.showComingSoon();
	};

	$scope.showComingSoon = function(){
		$modal.open({
			templateUrl: 'views/ComingModal.html',
			controller: 'ComingModalCtrl'
		});
	};

}]);
