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
	}).directive('transformLink', function() {
		return {
			restrict: 'A',
			scope: {
				transformLink: '@'
			},
			link: function(scope, element) {
				scope.$watch('transformLink', function () {
					if(element.context.textContent.indexOf('http://') === 0)
					{
						var link = element.context.textContent;
						element.text('');
						element.html('<a href="'+link+'"><i class="fa fa-external-link"></i>');
					}
				});
			}
		};
	});