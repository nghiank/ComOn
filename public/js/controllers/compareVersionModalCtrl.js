'use strict';

angular.module('ace.schematic').controller('CompareVersionModalCtrl', ['$scope', '$timeout', '$modalInstance', function($scope, $timeout, $modalInstance){
	$scope.mainVersion = 0;
	$scope.publish = function(){
		if($scope.mainVersion !== 0)
			$modalInstance.close($scope.mainVersion);
	};
	$scope.cancel = function(){
		$modalInstance.close(false);
	};
}]);