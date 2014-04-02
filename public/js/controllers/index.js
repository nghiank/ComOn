'use strict';

angular.module('ace.system').controller('IndexController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
    $scope.nav_menu = [];
    $scope.showSide = true;
    $scope.selected = null;
	if($scope.global.authenticated)
	{
		$scope.nav_menu.push({'title': 'My Favourites','link': 'views/favourites.html'});
		if($scope.global.user.isManufacturer === true || Global.user.isAdmin === true)
		{
			$scope.nav_menu.push({'title': 'My Catalog','link': 'views/Catalog/manageCatalog.html'});
			$scope.selected = {'title': 'My Catalog','link': 'views/Catalog/manageCatalog.html'};
		}
		if($scope.global.user.isAdmin === true)
		{
			$scope.nav_menu.push({'title': 'Manage Users','link': 'views/Users/list.html'});
			$scope.selected = null;
		}
		if(!$scope.global.user.isAdmin && !$scope.global.user.isManufacturer)
		{
			$scope.selected = {'title': 'My Favourites','link': 'views/favourites.html'};
		}
	}

	$scope.$on('changeUserStatus', function() {
		if($scope.global.authenticated)
		{
			$scope.nav_menu.push({'title': 'My Favourites','link': 'views/favourites.html'});
			if($scope.global.user.isManufacturer === true || Global.user.isAdmin === true)
				$scope.nav_menu.push({'title': 'My Catalog','link': 'views/Catalog/manageCatalog.html'});
			if($scope.global.user.isAdmin === true)
				$scope.nav_menu.push({'title': 'Manage Users','link': 'views/Users/list.html'});
		}
	});

	$scope.changeActivePage = function(item) {
		$scope.showSide = false;
		$scope.selected = item;
	};

	$scope.hideSide = function()
	{
		$scope.showSide = false;
	};

	$scope.revealSide = function()
	{
		$scope.showSide = true;
	};
}]);