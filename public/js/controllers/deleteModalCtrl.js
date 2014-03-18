'use strict';

angular.module('ace.schematic').controller('DeleteModalCtrl', ['$scope', '$timeout', '$modalInstance', function($scope, $timeout, $modalInstance){
	
	$scope.delete = function(){
		$modalInstance.close(true);
	};
	$scope.cancel = function(){
		$modalInstance.close(false);
	};
}]);