'use strict';

angular.module('ace.schematic').controller('editItemFormCtrl', ['$scope', '$timeout', '$modalInstance', function($scope, $timeout, $modalInstance){

	$scope.cancel = function(){
		$modalInstance.close(false);
	};
}]);