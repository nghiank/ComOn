'use strict';

angular.module('ace.system').controller('IndexController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
    $scope.nav_menu = [];
    $scope.showSide = true;
    $scope.selected = null;
	if($scope.global.authenticated)
	{
		$scope.nav_menu.push({'title': 'My Libraries','link': 'views/favourites.html', fa: 'fa-star'});
		if($scope.global.user.isManufacturer === true || Global.user.isAdmin === true)
		{
			$scope.nav_menu.push({'title': 'Manage My Catalog','link': 'views/Catalog/manageCatalog.html', fa: 'fa-shopping-cart'});
			$scope.selected = {'title': 'Manage My Catalog','link': 'views/Catalog/manageCatalog.html', fa: 'fa-shopping-cart'};
		}
		if($scope.global.user.isAdmin === true)
		{
			$scope.nav_menu.push({'title': 'Manage Users','link': 'views/Users/list.html', fa: 'fa-user'});
			$scope.selected = {'title': 'My Libraries','link': 'views/favourites.html', fa: 'fa-star'};
		}
		if(!$scope.global.user.isAdmin && !$scope.global.user.isManufacturer)
		{
			$scope.selected = {'title': 'My Libraries','link': 'views/favourites.html', fa: 'fa-star'};
		}
	}

	$scope.$on('changeUserStatus', function() {
		$scope.nav_menu = [];
		if($scope.global.authenticated)
		{
			$scope.nav_menu.push({'title': 'My Libraries','link': 'views/favourites.html', fa: 'fa-star'});
			if($scope.global.user.isManufacturer === true || Global.user.isAdmin === true)
			{
				$scope.nav_menu.push({'title': 'Manage the Catalog','link': 'views/Catalog/manageCatalog.html', fa: 'fa-shopping-cart'});
				$scope.selected = {'title': 'Manage the Catalog','link': 'views/Catalog/manageCatalog.html', fa: 'fa-shopping-cart'};
			}
			if($scope.global.user.isAdmin === true)
			{
				$scope.nav_menu.push({'title': 'Manage Users','link': 'views/Users/list.html', fa: 'fa-user'});
				$scope.selected = {'title': 'My Libraries','link': 'views/favourites.html', fa: 'fa-star'};
			}
			if(!$scope.global.user.isAdmin && !$scope.global.user.isManufacturer)
			{
				$scope.selected = {'title': 'My Libraries','link': 'views/favourites.html', fa: 'fa-star'};
			}
		}
	});

	$scope.changeActivePage = function(item) {
		$scope.selected = item;
	};
}]);