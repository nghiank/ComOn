'use strict';

angular.module('ace.system').controller('IndexController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
    $scope.nav_menu = [];
    $scope.showSide = true;
    $scope.selected = null;
	if($scope.global.authenticated)
	{
		$scope.nav_menu.push({'title': 'My Libraries','link': 'views/favourites.html'});
		if($scope.global.user.isManufacturer === true || Global.user.isAdmin === true)
		{
			$scope.nav_menu.push({'title': 'Manage the Catalog','link': 'views/Catalog/manageCatalog.html'});
			$scope.selected = {'title': 'Manage the Catalog','link': 'views/Catalog/manageCatalog.html'};
		}
		if($scope.global.user.isAdmin === true)
		{
			$scope.nav_menu.push({'title': 'Manage Users','link': 'views/Users/list.html'});
			$scope.selected = null;
		}
		if(!$scope.global.user.isAdmin && !$scope.global.user.isManufacturer)
		{
			$scope.selected = {'title': 'My Libraries','link': 'views/favourites.html'};
		}
	}

	$scope.$on('changeUserStatus', function() {
		$scope.nav_menu = [];
		if($scope.global.authenticated)
		{
			$scope.nav_menu.push({'title': 'My Libraries','link': 'views/favourites.html'});
			if($scope.global.user.isManufacturer === true || Global.user.isAdmin === true)
			{
				$scope.nav_menu.push({'title': 'Manage the Catalog','link': 'views/Catalog/manageCatalog.html'});
				$scope.selected = {'title': 'Manage the Catalog','link': 'views/Catalog/manageCatalog.html'};
			}
			if($scope.global.user.isAdmin === true)
			{
				$scope.nav_menu.push({'title': 'Manage Users','link': 'views/Users/list.html'});
				$scope.selected = null;
			}
			if(!$scope.global.user.isAdmin && !$scope.global.user.isManufacturer)
			{
				$scope.selected = {'title': 'My Libraries','link': 'views/favourites.html'};
			}
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