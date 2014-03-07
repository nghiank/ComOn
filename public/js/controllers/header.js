'use strict';

angular.module('ace.system').controller('HeaderController', ['$scope', 'Global', function ($scope, Global) {
	$scope.global = Global;

	$scope.menu = [{'title': 'Schematic Components','link': 'standards'}];
	
	if(Global.authenticated)
	{
		$scope.menu.push({'title': 'Favourites','link': 'favourites'});
		if(Global.user.isAdmin === true)
			$scope.menu.push({'title': 'Users','link': 'users'});
	}

	$scope.isCollapsed = false;
}]);