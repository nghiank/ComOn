'use strict';

angular.module('ace.catalog')
.controller('catalogListCtrl', ['$scope', 'Global', 'CatalogAPI', function ($scope, Global, CatalogAPI) {
	$scope.global = Global;
	$scope.pageItemLimit = 20;
	$scope.authorized = function() {
		if($scope.global.authenticated && ($scope.global.user.isAdmin || $scope.global.user.isManufacturer))
			return true;
		return false;
	};

	$scope.toggleOption = function(type){
		$scope.target = type;
	};

	$scope.init = function() {
		$scope.showTypes = true;
		$scope.types = CatalogAPI.types.query();
		$scope.showList = false;
	};

	$scope.showTypeList = function(type){
		$scope.showList = true;
		CatalogAPI.entries.query({type:type.code,upper:$scope.pageItemLimit}, function(response) {
			if(response)
			{
				console.log(response.data);
				$scope.items = response.data;
			}
		});
		$scope.fields = ['Description','Misc1','Misc2','weblink'];
		//$scope.items = [{'Catalog':'ABCD-1234','Manufacturer':'AB','Description':'STH,ANYTHING','Assembly Code':'ABCList'},
		//{'Catalog':'ABCD-1254','Manufacturer':'SIEMENS','Description':'ANYTHING','Assembly Code':'ABCList','weblink':'www.siemens.com'}];
		$scope.cols = ['Catalog','Manufacturer','Assembly Code'];
	};

	$scope.toggleType = function(){
		$scope.showTypes = !$scope.showTypes;
	};

	$scope.closeType = function(){
		$scope.showTypes = false;
	};

	$scope.toggleField = function(field){
		if($scope.cols.indexOf(field) === -1)
			$scope.cols.push(field);
		else
			$scope.cols.splice($scope.cols.indexOf(field),1);
		console.log($scope.cols.indexOf(field));
	};
}]);
