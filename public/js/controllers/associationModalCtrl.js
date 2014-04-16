'use strict';

angular.module('ace.catalog').controller('associationModalCtrl', ['$scope', '$modalInstance','data', 'UsersAPI', 'Global', function($scope, $modalInstance, data, UsersAPI, Global) {

	$scope.item = data.item;
	$scope.schematicEntries = [];

	$scope.populateEntries = function() {
		if(Global.authenticated)
		{
			for (var i = 0; i < Global.user.associations.length; i++) {
				var association = Global.user.associations[i];
				if(association.catalogId === $scope.item._id)
				{
					if(data.schematicLinks[association.schematicId])
					{
						var newObj = data.schematicLinks[association.schematicId];
						newObj.showOption = false;
						$scope.schematicEntries.push(newObj);
					}
				}
			}
		}
	};


	$scope.toggleOption = function (child) {
		if(typeof child.showOption === 'undefined')
			child.showOption = false;
		return (child.showOption = !child.showOption);
	};

	$scope.deleteAssociation = function(child) {
		UsersAPI.delAssociation.save({item: $scope.item._id, _id: child._id}, function(response) {
			if(response)
			{
				if(Global.authenticated) 
				{
					Global.user.associations = response;
					$scope.schematicEntries.splice($scope.schematicEntries.indexOf(child), 1);
					if($scope.schematicEntries.length === 0)
					{
						$modalInstance.close(true);
					}
				}
			}
		});
	};

	$scope.done = function(){
		$modalInstance.close(true);
	};

	$scope.cancel = function(){
		$modalInstance.close(false);
	};
}]);