'use strict';

angular.module('ace.catalog').controller('associationModalCtrl', ['$scope', '$modalInstance','data', 'UsersAPI', 'Global', '$modal', function($scope, $modalInstance, data, UsersAPI, Global, $modal) {

	$scope.item = data.item;
	$scope.schematicEntries = [];
	$scope.hide = false;

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


	$scope.toggleOption = function (child, set) {
		if(typeof child.showOption === 'undefined')
			child.showOption = false;
		return (child.showOption = set);
	};

	$scope.deleteAssociation = function(child) {
		$scope.hide = true;
		var modalInstance = $modal.open({
			templateUrl: 'views/confirmationModal.html',
			controller: 'confirmationModalCtrl',
			resolve: {
				title: function(){return 'Are you sure you want to delete this association?';},
				msg: function(){return '';}
			}
		});
		modalInstance.result.then(function(decision){
			$scope.hide = false;
			if(decision){
				UsersAPI.delAssociation.save({item: $scope.item._id, _id: child._id}, function(response) {
					if(response)
					{
						if(Global.authenticated) 
						{
							Global.user.associations = response;
							$scope.schematicEntries.splice($scope.schematicEntries.indexOf(child), 1);
							/*if($scope.schematicEntries.length === 0)
							{
								$modalInstance.close(true);
							}*/
						}
					}
				});
			}
		});
	};

	$scope.openAddLinkModal = function(){
		$scope.hide = true;
		console.log('item in association modal', $scope.item);
		var modalInstance = $modal.open({
			templateUrl: 'views/Catalog/catIconLinkModal.html',
			controller: 'catIconLinkModalCtrl',
			backdrop: 'static',
			windowClass: 'largerModal',
			resolve: {
				item: function(){
					var itemArray = [];
					itemArray.push($scope.item);
					return itemArray;
				}
			}
		});
		modalInstance.result.then(function(){
			$scope.hide = false;
			$scope.populateEntries();
		});
	};

	$scope.done = function(){
		$modalInstance.close(true);
	};

	$scope.cancel = function(){
		$modalInstance.close(false);
	};
}]);