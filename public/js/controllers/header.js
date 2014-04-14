'use strict';

angular.module('ace.system').controller('HeaderController', ['$scope', 'Global', function ($scope, Global) {
	$scope.global = Global;
	$scope.menu = [{'title': 'Icon Browser','link': 'standards'}, {'title': 'Catalog Browser','link': 'catalog'}];
}]);