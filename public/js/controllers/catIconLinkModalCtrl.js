'use strict';

angular.module('ace.catalog').controller('catIconLinkModalCtrl', ['Global', '$scope', '$timeout', '$modalInstance', 'SchematicsAPI', 'UsersAPI', 'item', '_', function(Global, $scope, $timeout, $modalInstance, SchematicsAPI, UsersAPI, item, _){


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
	$scope.selectedItem = null;

	$scope.link = function() {
		if(!$scope.linkDisabled)
		{
			if($scope.selectedHiearchy.length > 0)
				UsersAPI.addAssociation.save({items: _.map($scope.items, function(obj) {return obj._id;}), _id: $scope.selectedHiearchy[$scope.selectedHiearchy.length - 1]._id}, function(response) {
					if(response) {
						Global.user.associations = response;
						$modalInstance.close(true);
					}
				});
			else
				UsersAPI.addAssociation.save({items: _.map($scope.items, function(obj) {return obj._id;}), _id: $scope.selectedItem._id}, function(response){
					if(response){
						Global.user.associations = response;
						$modalInstance.close(true);
					}
				});
		}
	};

	$scope.setTarget = function(item){
		$scope.target = item;
	};

	$scope.removeTarget = function(){
		$scope.target = null;
	};

	$scope.getParentName = function(item){
		SchematicsAPI.node.get({nodeId:item.parentNode},function(response){
			$scope.itemParentName = response.name;
		});
	};

	$scope.getListOfItems = function() {
		return _.map($scope.items, function(obj){return obj.catalog;}).join(', ');
	};

	$scope.init = function() {
		SchematicsAPI.standardlist.query(function(standards) {
			$scope.stds = standards;
			$scope.typeAheadValues = [];
			$scope.levels.push({items: standards, levelNumber: 0});
			if(standards.length > 0)
			{
				$scope.selectedStdName = $scope.stds[0].name;
				SchematicsAPI.getAllChildren.save({name: $scope.selectedStdName}, function(response) {
					if(response)
					{
						for(var i in response)
							if(!response[i].isComposite)
								$scope.typeAheadValues.push(response[i]);
					}
				});
			}
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

	$scope.selectFromSearch = function(item){
		$scope.selectedItem = item;
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
				for (var j = 0; j < response.length; j++) {
					if(response[j].parentNode === option._id)
					{
						immediateChildren.push(response[j]);
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

	$scope.$watch('selectedItem',function(){
		if($scope.selectedItem!== null)
			$scope.linkDisabled = false;
	});
}]);