'use strict';

angular.module('ace.system').controller('HeaderController', ['$scope', 'Global', function ($scope, Global) {
	$scope.global = Global;

	$scope.menu = [{'title': 'Icon Browser','link': 'standards'}, {'title': 'Catalog Browser','link': 'catalog'}];
	
	if(Global.authenticated)
	{
		$scope.menu.push({'title': 'Favourites','link': 'favourites'});
		if(Global.user.isAdmin === true)
			$scope.menu.push({'title': 'Users','link': 'users'});
		if(Global.user.isManufacturer === true || Global.user.isAdmin === true)
			$scope.menu.push({'title': 'Manage My Catalog','link': 'catalog/new'});
	}

	$scope.isCollapsed = false;
}]);