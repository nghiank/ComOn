'use strict';

angular.module('ace.catalog')
.controller('catalogListCtrl', ['$scope', 'Global', 'CatalogAPI','$routeParams', function ($scope, Global, CatalogAPI, $routeParams) {
	$scope.global = Global;
	$scope.authorized = function() {
		if($scope.global.authenticated && ($scope.global.user.isAdmin || $scope.global.user.isManufacturer))
			return true;
		return false;
	};

	$scope.breadcrumbs = [{'title':'Catalog','link':'#!/views/Catalog/catalogTypeList.html'}];

	$scope.init = function() {
		console.log($routeParams.type);
		CatalogAPI.entries.query({type: $routeParams.type}, function(response) {
			if(response)
			{
				console.log(response);
			}
		});
		$scope.breadcrumbs.push({'title':$routeParams.type,'link':'#'});
	};

	$scope.fields = ['Description','Misc1','Misc2','weblink'];
	$scope.items = [{'Catalog':'ABCD-1234','Manufacturer':'AB','Description':'STH,ANYTHING','Assembly Code':'ABCList'},
	{'Catalog':'ABCD-1254','Manufacturer':'SIEMENS','Description':'ANYTHING','Assembly Code':'ABCList','weblink':'www.siemens.com'}];
	$scope.cols = ['Catalog','Manufacturer','Assembly Code'];

	$scope.toggleField = function(field){
		if($scope.cols.indexOf(field) === -1)
			$scope.cols.push(field);
		else
			$scope.cols.splice($scope.cols.indexOf(field),1);
		console.log($scope.cols.indexOf(field));
	};
}]);
