'use strict';

angular.module('ace.system').controller('HeaderController', ['$scope', 'Global', function ($scope, Global) {
	$scope.global = Global;

	$scope.menu = [{'title': 'Schematic Components','link': 'standards'}];
	
	if(Global.authenticated)
	{
		if(Global.user.isAdmin === true)
			$scope.menu.push({'title': 'Users','link': 'users'});
		$scope.menu.push({'title': 'Favourites','link': 'favourites'});
	}

	$scope.isCollapsed = false;
}]);