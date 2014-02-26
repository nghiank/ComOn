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
	$scope.editFormName = '';

	$scope.showEditForm = function (std) {
		$scope.editForm = true;
		$scope.editFormName = std.name;
	};
	$scope.toggleOption = function (std) {
		$scope.target = std;
		return (std.showOption = !std.showOption);
	};
/*	$scope.deleteWarning = function () {
		if ($scope.target.local === false) {
			$scope.target.local = true;
		} else {
			$scope.stds.splice($scope.stds.indexOf($scope.target), 1);
			$scope.target = null;
		}
	};
	$scope.uploadWarning = function () {
		$scope.stds[$scope.stds.indexOf($scope.target)].local = false;
	};*/
}]);
/*.controller('CompCtrl2', function ($scope, $window) {
	$scope.addForm = false;
	$scope.toggleAddForm = function () {
		$scope.addForm = !$scope.addForm;
		$scope.hasDetailContent = false;
	};
	$scope.comps = [
		{
			'name': '2D Position Maintain, NO',
			'showOption': false,
			'local': false,
			'leaf': true
		},
		{
			'name': '2D Position Maintain, NC',
			'showOption': false,
			'local': false,
			'leaf': true
		},
		{
			'name': '2D Position NO Return From Left',
			'showOption': false,
			'local': true,
			'leaf': true
		},
		{
			'name': '2D Position NC Return From left',
			'showOption': false,
			'local': false,
			'leaf': true
		},
		{
			'name': '8 Position NO',
			'showOption': false,
			'local': false,
			'leaf': true
		},
		{
			'name': 'Illuminated Slectors',
			'showOption': false,
			'local': false,
			'leaf': false
		}
	];
	$scope.types = [
		{ 'name': 'Subtype' },
		{ 'name': 'Component' }
	];
	$scope.isLeaf = $scope.types[0];
	$scope.addToList = function () {
		if ($scope.isLeaf.name === 'Subtype') {
			$scope.comps.push({
				'name': 'Something new',
				'showOption': false,
				'local': true,
				'leaf': false
			});
			$window.location.href = 'Subtype_form_2.html';
		} else
			$scope.comps.push({
				'name': 'Something new',
				'showOption': false,
				'local': true,
				'leaf': true
			});
	};
	$scope.hasDetailContent = false;
	$scope.toggleOption = function (type) {
		$scope.target = type;
		if (!$scope.addForm) {
			$scope.hasDetailContent = true;
			$scope.detailName = type.name;
			$scope.detailContent = type.leaf ? 'Download Related DWG Files' : '';
		}
		return (type.showOption = !type.showOption);
	};
	$scope.uploadWarning = function () {
		$scope.comps[$scope.comps.indexOf($scope.target)].local = false;
	};
	$scope.deleteWarning = function () {
		if ($scope.target.local === false) {
			$scope.target.local = true;
			$scope.comps[$scope.comps.indexOf($scope.terget)].local = true;
		} else {
			$scope.comps.splice($scope.comps.indexOf($scope.target), 1);
		}
	};
})
.controller('CompCtrl', function ($scope, $window) {
	$scope.addForm = false;
	$scope.toggleAddForm = function () {
		$scope.addForm = !$scope.addForm;
		$scope.hasDetailContent = false;
	};
	$scope.comps = [];
	$scope.types = [
		{ 'name': 'Subtype' },
		{ 'name': 'Component' }
	];
	$scope.isLeaf = $scope.types[0];
	$scope.addToList = function () {
		if ($scope.isLeaf.name === 'Subtype') {
			$scope.comps.push({
				'name': 'Something new',
				'showOption': false,
				'local': true,
				'leaf': false
			});
			$window.location.href = 'Subtype_form_2.html';
		} else
			$scope.comps.push({
				'name': 'Something new',
				'showOption': false,
				'local': true,
				'leaf': true
			});
	};
	$scope.hasDetailContent = false;
	$scope.toggleOption = function (type) {
		$scope.target = type;
		if (!$scope.addForm) {
			$scope.hasDetailContent = true;
			$scope.detailName = type.name;
			$scope.detailContent = type.leaf ? 'Download Related DWG Files' : '';
		}
		return (type.showOption = !type.showOption);
	};
	$scope.deleteWarning = function () {
		if ($scope.target.local === false) {
			$scope.target.local = true;
			$scope.comps[$scope.comps.indexOf($scope.target)].local = true;
		} else {
			$scope.comps.splice($scope.comps.indexOf($scope.target), 1);
			$scope.target = null;
		}
	};
	$scope.uploadWarning = function () {
		$scope.comps[$scope.comps.indexOf($scope.target)].local = false;
	};
})
.controller('SubtypeCtrl', function ($scope, $window) {
	$scope.addForm = false;
	$scope.toggleAddForm = function () {
		$scope.addForm = !$scope.addForm;
	};
	$scope.subs = [
		{
			'name': 'Push Buttons',
			'showOption': false,
			'local': false
		},
		{
			'name': 'Selector Switches',
			'showOption': false,
			'local': false
		},
		{
			'name': 'Fuses',
			'showOption': false,
			'local': false
		},
		{
			'name': 'Relays/Contacts',
			'showOption': false,
			'local': false
		},
		{
			'name': 'Timers',
			'showOption': false,
			'local': false
		},
		{
			'name': 'Motor Control',
			'showOption': false,
			'local': true
		}
	];
	$scope.types = [
		{ 'name': 'Subtype' },
		{ 'name': 'Component' }
	];
	$scope.isLeaf = $scope.types[0];
	$scope.addToList = function () {
		if ($scope.isLeaf.name === 'Subtype') {
			$scope.comps.push({
				'name': 'Something new',
				'showOption': false,
				'local': true,
				'leaf': false
			});
			$window.location.href = 'Subtype_form_2.html';
		} else
			$scope.comps.push({
				'name': 'Something new',
				'showOption': false,
				'local': true,
				'leaf': true
			});
	};
	$scope.hasDetailContent = false;
	$scope.toggleOption = function (type) {
		$scope.target = type;
		if (!$scope.addForm) {
			$scope.hasDetailContent = true;
			$scope.detailName = type.name;
			$scope.detailContent = type.leaf ? 'Download Related DWG Files' : '';
		}
		//$scope.target.showOption = !$scope.target.showOption;
		return (type.showOption = !type.showOption);
	};
	$scope.uploadWarning = function () {
		$scope.target.local = false;
		$scope.subs[$scope.subs.indexOf($scope.target)].local = false;
	};
	$scope.deleteWarning = function () {
		if ($scope.target.local === false) {
			$scope.target.local = true;
			$scope.subs[$scope.subs.indexOf($scope.target)].local = true;
		} else {
			$scope.subs.splice($scope.subs.indexOf($scope.target), 1);
		}
	};
})*/
