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
	}]).directive('hasCuzMenu',function($document){
		return{
			restrict:'A',
			link: function(scope){
				var doc = $document;
				var contextmenu = angular.element(document.querySelector('#contextMenu'));
				var table = angular.element(document.querySelector('table'));
				doc.bind('click',function(){
					contextmenu.hide();
				});

				doc.on('keydown',function(e){
					if(e.shiftKey){
						scope.multiple = true;
						table.addClass('unselectable');
						return;
					}
					if(e.keyCode === 17 || (e.metaKey && e.keyCode === 91)){
						scope.multiple = true;
						scope.ctrl = true;
					}
				});
				doc.on('keyup',function(e){
					if(e.keyCode === 16){
						scope.multiple = false;
						table.removeClass('unselectable');
						return;
					}
					if(e.keyCode === 17 || e.keyCode === 91){
						scope.ctrl = false;
						scope.multiple = false;
					}
				});
			}
		};
	}).directive('cuzMenuItem',function(){
		return{
			restrict:'A',
			link: function(scope,elements){
				var contextmenu = angular.element(document.querySelector('#contextMenu'));
				elements.bind('click',function(){
					contextmenu.hide();
				});
			}
		};
	}).directive('cuzMenu',function(){
		return{
			restric:'A',
			link: function(scope,elements){
				var contextmenu = angular.element(document.querySelector('#contextMenu'));
				scope.$watch('selectedItems',function(){
					if(!elements.hasClass('highlighted')){
						elements.unbind('contextmenu');
						elements.bind('contextmenu', function(){
							contextmenu.hide();
						});
					}else{
						elements.unbind('contextmenu');
						elements.bind('contextmenu',function(e){
							e.preventDefault();
						if(scope.selectedItems.length > 0)
							contextmenu.css({left: e.pageX, top: e.pageY,position:'absolute'}).show();
						});
					}						
				},true);				

			}
		};
	}).directive('contextMenu',function(){
		return{
			restrict:'A',
			link: function(scope,elements){
				elements.hide();
			}
		};
	}).directive('autoScroll', function () {
		return {
			restrict: 'A',
			scope: {
				autoScroll: '@'
			},
			link: function postLink(scope, element, attrs) {
				scope.$watch('autoScroll', function () {
					if(attrs.autoScroll) {
						var attribute = JSON.parse(attrs.autoScroll);
						var current = attribute.current;
						var total = attribute.total;
						var ratio = current/total;
						var scrollTo = element.prop('scrollWidth')*ratio;
						element.animate({scrollLeft: scrollTo}, 300);
						}
					}
				);
			}
		};
	});