'use strict';

angular.module('ace.schematic').controller('DeleteModalCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance){
	
	$scope.delete = function(){
		$modalInstance.close(true);
	};
	$scope.cancel = function(){
		$modalInstance.close(false);
	};
}]);