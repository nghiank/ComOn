'use strict';

angular.module('ace.catalog').controller('catIconLinkModalCtrl', ['$scope', '$timeout', '$modalInstance', 'item', function($scope, $timeout, $modalInstance,item){

	$scope.cancel = function(){
		$modalInstance.close(false);
	};

	$scope.item = [];
	for(var i in item)
		$scope.item.push(item[i]);
}]);