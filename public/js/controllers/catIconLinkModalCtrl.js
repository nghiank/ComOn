'use strict';

angular.module('ace.catalog').controller('catIconLinkModalCtrl', ['$scope', '$timeout', '$modalInstance', 'SchematicsAPI','item', function($scope, $timeout, $modalInstance, SchematicsAPI,item){


	$scope.cancel = function(){
		$modalInstance.close(false);
	};
	$scope.query = {};
	$scope.query.text = '';
	$scope.linkDisabled = true;
	$scope.levels = [];
	$scope.selectedHiearchy = [];
	$scope.selectedStd = null;
	$scope.selectedStdName = null;
	$scope.selectedLevel = null;
	$scope.init = function() {
		SchematicsAPI.standardlist.query(function(standards) {
			$scope.stds = standards;
			$scope.typeAheadValues = [];
			$scope.selectedStdName = $scope.stds[0].name;
			$scope.levels.push({items: standards, levelNumber: 0});
			SchematicsAPI.getAllChildren.save({name: $scope.selectedStdName}, function(response) {
				if(response)
				{
					for(var i in response)
						if(!response[i].isComposite)
							$scope.typeAheadValues.push(response[i]);
				}

			});
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

	$scope.selectSearchStd = function(option){
		$scope.selectedStdName = option.name;
		$scope.typeAheadValues =[];
		SchematicsAPI.getAllChildren.save({name: option.name}, function(response) {
			if(response)
			{
				for(var i in response)
						if(!response[i].isComposite)
							$scope.typeAheadValues.push(response[i]);
			}
		});
	};

	$scope.selectStandard = function(option)
	{
		$scope.selectedStdName = option.name;
		SchematicsAPI.getAllChildren.save({name: option.name}, function(response) {
			if(response)
			{
				$scope.selectedStd = response;
				$scope.typeAheadValues = [];
				for(var i in response)
						if(!response[i].isComposite)
							$scope.typeAheadValues.push(response[i]);
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

/*	$scope.selectFromSearch = function(option){

	};*/

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