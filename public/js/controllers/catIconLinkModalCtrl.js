'use strict';

angular.module('ace.catalog').controller('catIconLinkModalCtrl', ['$scope', '$timeout', '$modalInstance', 'SchematicsAPI', function($scope, $timeout, $modalInstance, SchematicsAPI){

	$scope.cancel = function(){
		$modalInstance.close(false);
	};
	$scope.text = null;
	$scope.recent = null;
	$scope.init = function() {
		SchematicsAPI.standardlist.query(function(standards) {
			$scope.stds = standards;
		});
	};
	$scope.selectStandard = function(option)
	{
		$scope.stdSelected = option;
		$scope.recent = option._id;
		$scope.options = {groups:[], leaves: []};
		$scope.children = {groups:[], leaves: []};
		SchematicsAPI.getAllChildren.save({name: option.name}, function(response) {
			if(response)
			{
				for (var i = 0; i < response.length; i++) {
					if(response[i].isComposite)
					{
						$scope.options.groups.push(response[i]);
						if(response[i].parentNode === $scope.recent)
						{
							$scope.children.groups.push(response[i]);
						}
					}
					else
					{
						$scope.options.leaves.push(response[i]);
						if(response[i].parentNode === $scope.recent)
						{
							$scope.children.leaves.push(response[i]);
						}
					}
				}
			}
		});
	};

	$scope.select = function(option)
	{
		$scope.recent = option._id;
		$scope.children = {groups:[], leaves: []};
		for (var i = 0; i < $scope.options.groups.length; i++) {
			if($scope.options.groups[i].parentNode === $scope.recent)
			{
				$scope.children.groups.push($scope.options.groups[i]);
			}
		
		}
		for (i = 0; i < $scope.options.leaves.length; i++) {
			if($scope.options.leaves[i].parentNode === $scope.recent)
			{
				$scope.children.leaves.push($scope.options.leaves[i]);
			}
		
		}
	};

}]);