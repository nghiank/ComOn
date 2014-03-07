'use strict';

angular.module('ace')
.controller('Favourites', ['$scope', 'Global', 'Users', function ($scope, Global, Users) {
	$scope.Global = Global;
	$scope.schematic = [];
	$scope.getFavourites = function() {
		Users.getFav.query(function(favourites) {
			$scope.schematic = favourites.schematic;
		});
	};
	$scope.toggleOption = function (child) {
		return (child.showOption = !child.showOption);
	};

	$scope.seperate = function() {

	};

	$scope.unpublished = function(child) {
		return child.isPublished || $scope.admin;
	};

}]);
