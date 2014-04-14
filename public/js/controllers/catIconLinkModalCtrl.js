'use strict';

angular.module('ace.catalog').controller('catIconLinkModalCtrl', ['$scope', '$timeout', '$modalInstance', 'SchematicsAPI','item', function($scope, $timeout, $modalInstance, SchematicsAPI,item){


	$scope.cancel = function(){
		$modalInstance.close(false);
	};

	$scope.text = '';
	$scope.genText = [];
	$scope.recent = null;
	$scope.placeholder = '';
	$scope.linkDisabled = true;
	$scope.levels = [];
	$scope.selectedHiearchy = [];
	$scope.selectedStd = null;

	$scope.init = function() {
		SchematicsAPI.standardlist.query(function(standards) {
			$scope.stds = standards;
			$scope.levels.push({items: standards, levelNumber: 0});
		});
		$scope.item = [];
		for(var i in item)
			$scope.item.push(item[i]);
		$scope.stdSelected = null;
	};

	$scope.isSelected = function(level, item)
	{
		var selectedOption = $scope.selectedHiearchy[level];
		if(item._id === selectedOption)
		{
			return true;
		}
		return false;
	};

	$scope.selectOption = function(level, item)
	{
		if($scope.selectedHiearchy[level] && $scope.selectedHiearchy[level] !== item._id)
		{
			$scope.levels.splice(level+1, $scope.levels.length);
		}
		$scope.selectedHiearchy[level] = item._id;
		if(item.parentNode === null)
		{
			$scope.selectStandard(item);
		}
/*		else
		{
			$scope.select(item);
		}*/
	};

	$scope.selectStandard = function(option)
	{
		SchematicsAPI.getAllChildren.save({name: option.name}, function(response) {
			if(response)
			{
				$scope.selectedStd = response;
				var immediateChildren = [];
				for (var i = 0; i < response.length; i++) {
					if(response[i].parentNode === option._id)
					{
						immediateChildren.push(response[i]);
					}
				}
				$scope.levels.push({items: immediateChildren, levelNumber: 1});
			}
		});
	};

	$scope.select = function(option)
	{
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