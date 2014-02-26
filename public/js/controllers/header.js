'use strict';

angular.module('ace.system').controller('HeaderController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;

    $scope.menu = [{'title': 'Schematic Components','link': 'schematics'}];
    
    if(Global.authenticated && Global.user.isAdmin === true)
    {
		$scope.menu.push({'title': 'Users','link': 'users'});
    }

    $scope.isCollapsed = false;
}]);