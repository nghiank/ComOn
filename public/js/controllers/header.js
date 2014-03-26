'use strict';

angular.module('ace.system').controller('HeaderController', ['$scope', 'Global', function ($scope, Global) {
	$scope.global = Global;

	$scope.menu = [{'title': 'Icon Browser','link': 'standards'}, {'title': 'Catalog Browser','link': 'catalog'}];
	if($scope.global.authenticated)
	{
		$scope.menu.push({'title': 'My Favourites','link': 'favourites'});
		if($scope.global.user.isManufacturer === true || Global.user.isAdmin === true)
			$scope.menu.push({'title': 'My Catalog','link': 'manageCatalog'});
		if($scope.global.user.isAdmin === true)
			$scope.menu.push({'title': 'Manage Users','link': 'users'});
	}

	$scope.$on('changeUserStatus', function() {
		$scope.menu = [{'title': 'Icon Browser','link': 'standards'}, {'title': 'Catalog Browser','link': 'catalog'}];
		if($scope.global.authenticated)
		{
			$scope.menu.push({'title': 'My Favourites','link': 'favourites'});
			if($scope.global.user.isManufacturer === true || Global.user.isAdmin === true)
				$scope.menu.push({'title': 'Manage My Catalog','link': 'manageCatalog'});
			if($scope.global.user.isAdmin === true)
				$scope.menu.push({'title': 'Manage Users','link': 'users'});
		}
	});

	$scope.isCollapsed = false;
}]);