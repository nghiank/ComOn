'use strict';

angular.module('ace').directive('resetForm',
	function () {
		return {
			restrict: 'A',
			scope: {
				resetForm: '@'
			},
			link: function (scope, elements) {
				scope.$watch('resetForm', function () {
					for (var i = 0; i < elements.length; i++) {
						var form = elements[i];
						form.reset();
					}
				});
			}
		};
	}).directive('transformLink', [function() {
		return {
			restrict: 'A',
			link: function(scope, element, attr) {
				scope.$watch('cols.length', function () {
					if(attr.transformLink.indexOf('HTTP://') === 0)
					{
						var link = attr.transformLink;
						element.text('');
						element.html('<a href="'+link+'"><i class="fa fa-external-link"></i>');
					}
					else if(attr.transformLink.indexOf('WWW.') > -1)
					{
						var unmodified_link = attr.transformLink;
						var modified_link = 'HTTP://' + unmodified_link.substring(unmodified_link.indexOf('WWW.'));
						element.text('');
						element.html('<a href="'+modified_link+'"><i class="fa fa-external-link"></i>');
					}
					else
					{
						element.text(attr.transformLink);
					}
				});
			}
		};
	}]);