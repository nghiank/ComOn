'use strict';

angular.module('ace.catalog')
.controller('catalogTypeListCtrl', ['$scope', 'Global', 'CatalogAPI', function ($scope, Global, CatalogAPI) {
	$scope.global = Global;
	$scope.authorized = function() {
		if($scope.global.authenticated && ($scope.global.user.isAdmin || $scope.global.user.isManufacturer))
			return true;
		return false;
	};


	$scope.getTypes = function (){
		console.log('in');
		$scope.types = CatalogAPI.types.query();
		console.log($scope.types);
	};

	$scope.toggleOption = function(type){
		$scope.target = type;
	};

}]);
