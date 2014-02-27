'use strict';

angular.module('ace.schematic').factory('breadcrumbs', ['$resource', function ($resource) {
	var list = [{'title': 'Standards', 'link': '#!/standards'}];
	var breadcrumbs = {
		all : function() {
			return list;
		},
		add : function(parents) {
			list = list.concat(parents);
		},
		reset: function() {
			list = [{'title': 'Standards', 'link': '#!/standards'}];
		},
		fetch:$resource('api/getParentHiearchy/:nodeId',
							{nodeId: '@_id'})
	};
	return breadcrumbs;
}]);