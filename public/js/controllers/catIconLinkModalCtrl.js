'use strict';

angular.module('ace.catalog').controller('catIconLinkModalCtrl', ['$scope', '$timeout', '$modalInstance', function($scope, $timeout, $modalInstance){

	$scope.cancel = function(){
		$modalInstance.close(false);
	};

	$scope.stds = ['JIC','IEEE','Hydraulic'];
	$scope.subs = ['JIC: Push Button', 'JIC: Switches', 'JIC: Fuses'];

	$scope.addJIC = function(){
		$scope.show=true;
		$scope.text = 'JIC';
		$scope.$apply();
	};

	$scope.addJICPB = function(){
		$scope.text += ' Push Button';
	};
}]);