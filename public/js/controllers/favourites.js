'use strict';

angular.module('ace')
.controller('Favourites', ['$scope', 'Global', 'UsersAPI', '$modal', '_', function ($scope, Global, UsersAPI, $modal, _) {
	$scope.Global = Global;
	$scope.schematic = [];

	var setFavVersions = function() {
		for (var i = $scope.schematic.length - 1; i >= 0; i--) {
			var findIconVersion = _.find(Global.user.SchemFav, function (obj) { return $scope.schematic[i]._id === obj.schematicId; });
			if(findIconVersion)
			{
				$scope.schematic[i].favVersion = findIconVersion.iconVersion;
			}
		}
	};

	$scope.getFavourites = function() {
		UsersAPI.getFav.query(function(favourites) {
			$scope.schematic = favourites.schematic;
			setFavVersions();
		});
	};
	$scope.toggleOption = function (child, set) {
		if(typeof child.showOption === 'undefined')
			child.showOption = false;
		return (child.showOption = set);
	};


	$scope.delSchemFav = function(child){
		if(child.isComposite)
			return;
		if(child.published === 0)
			return;
		UsersAPI.delSchemFav.save({_id: child._id}, function(response) {
			if(response)
			{
				$scope.schematic.splice($scope.schematic.indexOf(child), 1);
				$scope.Global.setFav(response);
			}
		});
	};

	$scope.updateFav = function(child) {
		var modalInstance = $modal.open({
			templateUrl: 'views/confirmationModal.html',
			controller:'confirmationModalCtrl',
			backdrop: 'static',
			resolve:{
				title: function(){return 'Are you sure you want to update this favourite to the latest icon version?';},
				msg: function(){return '';}
			}
		});
		modalInstance.result.then(function(decision){
			if(decision){
				UsersAPI.updateSchemFav.save({_id: child._id}, function(response) {
					if(response)
					{
						$scope.Global.setFav(response);
						child.favVersion = child.published;
					}
				});
			}
		});

	};

	$scope.deleteFilter = function(child) {
		var modalInstance = $modal.open({
			templateUrl: 'views/confirmationModal.html',
			controller:'confirmationModalCtrl',
			backdrop: 'static',
			resolve:{
				title: function(){return 'Are you sure you want to delete?';},
				msg: function(){return 'This cannot be undone.';}
			}
		});
		modalInstance.result.then(function(decision){
			if(decision){
				UsersAPI.delFilter.save({name: child.name}, function(response) {
					if(response)
					{
						Global.user.catalogFilters = response;
					}
				});
			}
		});

	};

}]);
