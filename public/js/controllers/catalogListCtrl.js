'use strict';

angular.module('ace.catalog')
.controller('catalogListCtrl', ['$scope','Global', function ($scope, Global) {
	$scope.Global = Global;
	$scope.admin = false;
	if($scope.Global.authenticated && $scope.Global.user.isAdmin)
		$scope.admin = true;

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
