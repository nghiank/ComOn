'use strict';

angular.module('ace')
.controller('Favourites', ['$scope', 'Global', 'Users', function ($scope, Global, Users) {
	$scope.Global = Global;
	$scope.schematic = [];
	$scope.getFavourites = function() {
		Users.getFav.query(function(favourites) {
			$scope.schematic = favourites.schematic;
			var listofFav = [];
			for (var i = 0; i < $scope.schematic.length; i++) {
				listofFav.push($scope.schematic[i]._id);
			}
			$scope.Global.setFav(listofFav);
		});
	};
	$scope.toggleOption = function (child) {
		return (child.showOption = !child.showOption);
	};

	$scope.seperate = function() {

	};

	$scope.delSchemFav = function(child){
		if(child.isComposite)
			return;
		Users.delSchemFav.save({_id: child._id}, function(response) {
			if(response)
			{
				console.log('favourite deleted');
				$scope.schematic.splice($scope.schematic.indexOf(child), 1);
				$scope.Global.setFav(response);
			}

		});
	};

	$scope.unpublished = function(child) {
		return child.isPublished || $scope.admin;
	};

}]);
