'use strict';

angular.module('ace.schematic')
.controller('SchCtrl', ['$scope', 'Schematics', 'Global', 'breadcrumbs', function ($scope, Schematics, Global, breadcrumbs) {
	$scope.breadcrumbs = breadcrumbs;
	$scope.admin = false;
	if(Global.user && Global.user.isAdmin)
		$scope.admin = true;
	$scope.addForm = false;

	$scope.toggleAddForm = function () {
		$scope.addForm = !$scope.addForm;
		$scope.editForm = false;
	};
	$scope.getAll = function() {
		Schematics.standardlist.query(function(standards) {
			for(var i in standards)
			{
				standards[i].showOption = false;
			}
			$scope.stds = standards;
		});
	};
	$scope.editForm = false;

	$scope.toggleEditForm = function () {
		$scope.editForm = !$scope.editForm;
		$scope.addForm = false;
	};
	
	$scope.toggleOption = function (std) {
		$scope.target = std;
		return (std.showOption = !std.showOption);
	};
}]);
