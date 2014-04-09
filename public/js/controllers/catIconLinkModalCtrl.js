'use strict';

angular.module('ace.catalog').controller('catIconLinkModalCtrl', ['$scope', '$timeout', '$modalInstance', 'SchematicsAPI','item', function($scope, $timeout, $modalInstance, SchematicsAPI,item){


	$scope.cancel = function(){
		$modalInstance.close(false);
	};

	$scope.text = '';
	$scope.genText = [];
	$scope.recent = null;
	$scope.placeholder = '';
	$scope.init = function() {
		SchematicsAPI.standardlist.query(function(standards) {
			$scope.stds = standards;
		});
		$scope.item = [];
		for(var i in item)
			$scope.item.push(item[i]);
		$scope.stdSelected = null;
	};

	$scope.selectStandard = function(option)
	{
		$scope.text = ($scope.text.split(' ').splice($scope.text.split(' ').length-1,1).join(' ')+ '  ' + option.name.split(':')[0]).trim();
		$scope.genText.push((option.name.split(':')[0]).trim());
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
		$scope.text = ($scope.text.split(' ').splice($scope.text.split(' ').length-1,1).join(' ') + option.name.split(':')[1]).trim();
		$scope.genText.push((option.name.split(':')[1]).trim());
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

	$scope.$watch('text',function(){
		$scope.lastWord = ($scope.text.split(' ')[$scope.text.split(' ').length-1]).trim();
		if($scope.genText.indexOf($scope.lastWord) > -1)
			$scope.lastWord = '';
	});

}]);