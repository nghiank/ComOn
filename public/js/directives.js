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
			link: function(scope, element) {
				scope.$watch('cols.length', function () {
					console.log(element);
					if(element.context.textContent.indexOf('http://') === 0)
					{
						var link = element.context.textContent;
						element.text('');
						element.html('<a href="'+link+'"><i class="fa fa-external-link"></i>');
					}
					else if(element.context.textContent.indexOf('www.') > -1)
					{
						var unmodified_link = element.context.textContent;
						var modified_link = 'http://' + unmodified_link.substring(unmodified_link.indexOf('www.'));
						element.text('');
						element.html('<a href="'+modified_link+'"><i class="fa fa-external-link"></i>');
					}
				});
			}
		};
	});