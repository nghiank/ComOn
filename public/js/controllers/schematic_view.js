'use strict';

angular.module('ace.schematic')
.controller('Standards', ['$scope', 'Schematics', 'Global', 'breadcrumbs', function ($scope, Schematics, Global, breadcrumbs) {
	$scope.breadcrumbs = breadcrumbs;
	$scope.admin = false;
	if(Global.user && Global.user.isAdmin)
		$scope.admin = true;
	$scope.form = null;
	$scope.forms = [{'name':'addForm','URL':'/views/upload.html'},{'name':'edifForm','URL':'/views/edit.html'}];

	$scope.showAddForm = function () {
		$scope.form = $scope.forms[0];
	};

	$scope.getAll = function() {
		$scope.breadcrumbs.reset();
		Schematics.standardlist.query(function(standards) {
			$scope.stds = standards;
			for(var i = 0; i < standards.length; i++)
			{
				$scope.stds[i].showOption = false;
			}
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
