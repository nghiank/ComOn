'use strict';

angular.module('ace.catalog').controller('catIconLinkModalCtrl', ['Global', '$scope', '$timeout', '$modalInstance', 'SchematicsAPI', 'UsersAPI', 'item', '_', function(Global, $scope, $timeout, $modalInstance, SchematicsAPI, UsersAPI, item, _){


	$scope.cancel = function(){
		$modalInstance.close(false);
	};

	$scope.linkDisabled = true;
	$scope.levels = [];
	$scope.selectedHiearchy = [];
	$scope.selectedStd = null;
	$scope.selectedLevel = null;

	$scope.link = function() {
		if(!$scope.linkDisabled)
		{
			UsersAPI.addAssociation.save({items: _.map($scope.items, function(obj) {return obj._id;}), _id: $scope.selectedHiearchy[$scope.selectedHiearchy.length - 1]._id}, function(response) {
				if(response) {
					Global.user.associations = response;
					$modalInstance.close(true);
				}
			});
		}
	};

	$scope.init = function() {
		SchematicsAPI.standardlist.query(function(standards) {
			$scope.stds = standards;
			$scope.levels.push({items: standards, levelNumber: 0});
		});
		$scope.items = [];
		for(var i in item)
			$scope.items.push(item[i]);
	};

	$scope.isSelected = function(level, item)
	{
		var selectedOption = $scope.selectedHiearchy[level];
		if(selectedOption && item._id === selectedOption._id)
		{
			return true;
		}
		return false;
	};

	$scope.selectOption = function(level, item)
	{
		$scope.selectedLevel = {current: parseInt(level, 10), total: parseInt($scope.levels.length, 10)};
		if($scope.selectedHiearchy[level] && $scope.selectedHiearchy[level]._id !== item._id)
		{
			$scope.levels.splice(level+1, $scope.levels.length);
			$scope.selectedHiearchy.splice(level+1, $scope.selectedHiearchy.length);
		}
		if(!$scope.selectedHiearchy[level] || ($scope.selectedHiearchy[level] && $scope.selectedHiearchy[level]._id !== item._id))
		{
			$scope.selectedHiearchy[level] = {_id: item._id, isComposite: item.isComposite};
			if(item.parentNode === null)
			{
				$scope.selectStandard(item);
			}
			else
			{
				$scope.select(level, item);
			}
		}
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

	$scope.select = function(level, option)
	{
		var immediateChildren = [];
		for (var i = 0; i < $scope.selectedStd.length; i++) {
			if($scope.selectedStd[i].parentNode === option._id)
			{
				immediateChildren.push($scope.selectedStd[i]);
			}
		}
		if(option.isComposite)
			$scope.levels[level+1] = {items: immediateChildren, levelNumber: level+1};
	};

	$scope.$watchCollection('selectedHiearchy', function() {
		for (var i = 0; i < $scope.selectedHiearchy.length; i++) {
			if(!$scope.selectedHiearchy[i].isComposite)
			{
				$scope.linkDisabled = false;
				return;
			}
		}
		$scope.linkDisabled = true;
	});
}]);