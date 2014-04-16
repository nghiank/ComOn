'use strict';

angular.module('ace')
.controller('Favourites', ['$scope', 'Global', 'UsersAPI', '$modal', function ($scope, Global, UsersAPI, $modal) {
	$scope.Global = Global;
	$scope.schematic = [];

	$scope.getFavourites = function() {
		UsersAPI.getFav.query(function(favourites) {
			$scope.schematic = favourites.schematic;
			var listofFav = [];
			for (var i = 0; i < $scope.schematic.length; i++) {
				listofFav.push($scope.schematic[i]._id);
			}
			$scope.Global.setFav(listofFav);
		});
	};
	$scope.toggleOption = function (child, set) {
		if(typeof child.showOption === 'undefined')
			child.showOption = false;
		return (child.showOption = set);
	};


	$scope.delSchemFav = function(child){
		if(child.isComposite)
			return;
		UsersAPI.delSchemFav.save({_id: child._id}, function(response) {
			if(response)
			{
				$scope.schematic.splice($scope.schematic.indexOf(child), 1);
				$scope.Global.setFav(response);
			}
		});
	};

	$scope.unpublished = function(child) {
		return child.isPublished || $scope.admin;
	};

	$scope.deleteFilter = function(child) {
		var modalInstance = $modal.open({
			templateUrl: 'views/confirmationModal.html',
			controller:'confirmationModalCtrl',
			backdrop: 'static',
			resolve:{
				title: function(){return 'Are you sure you want to delete?';},
				msg: function(){return 'This cannot be undone.';}
			}
		});
		modalInstance.result.then(function(decision){
			if(decision){
				UsersAPI.delFilter.save({name: child.name}, function(response) {
					if(response)
					{
						Global.user.catalogFilters = response;
					}
				});
			}
		});

	};

}]);
