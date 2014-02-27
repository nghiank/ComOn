'use strict';

angular.module('ace.schematic')
.controller('Children', ['$scope', 'Schematics', '$routeParams', 'Global', 'breadcrumbs', function ($scope, Schematics, $routeParams, Global, breadcrumbs) {
	$scope.breadcrumbs = breadcrumbs;
	$scope.admin = false;
	if(Global.user && Global.user.isAdmin)
		$scope.admin = true;
	$scope.getChildren = function(id) {
		var nodeId = id;
		if(!id)
			nodeId = $routeParams.nodeId;
		Schematics.children.get({nodeId: nodeId}, function(children) {
			$scope.children = children.children;
		});
		if($routeParams.nodeId)
			breadcrumbs.fetch.get({nodeId: $routeParams.nodeId}, function(result) {
				var hiearchy = result.parentHiearchy;
				for (var i = hiearchy.length - 1; i >= 0; i--) {
					hiearchy[i].link = '#!/standards/' + hiearchy[i].link;
				}
				breadcrumbs.add(hiearchy);
			});
	};
	$scope.toggleOption = function (child) {
		$scope.target = child;
		return (child.showOption = !child.showOption);
	};
	$scope.composite = function(child) {
		return child.isComposite;
	};
/*	$scope.addForm = false;

	$scope.toggleAddForm = function () {
		$scope.addForm = !$scope.addForm;
		$scope.editForm = false;
	};*/
/*	$scope.editForm = false;

	$scope.toggleEditForm = function () {
		$scope.editForm = !$scope.editForm;
		$scope.addForm = false;
	};
*/

}]);
