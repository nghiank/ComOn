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
						element.html('<a href="'+link+'"  target="_blank"><i class="fa fa-external-link"></i>');
						element.bind('click', function(e) {e.stopPropagation();});
					}
					else if(attr.transformLink.indexOf('WWW.') > -1)
					{
						var unmodified_link = attr.transformLink;
						var modified_link = 'HTTP://' + unmodified_link.substring(unmodified_link.indexOf('WWW.'));
						element.text('');
						element.html('<a href="'+modified_link+'" target="_blank"><i class="fa fa-external-link"></i>');
						element.bind('click', function(e) {e.stopPropagation();});
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
	}).directive('detectHeight',function(){
		return{
			restrict:'A',
			link: function(scope,element){
					element.bind('click',function(e){
						if(element.parent().children().hasClass('dropdown-menu')){
							var menu = element.parent().children('.dropdown-menu');
							if(menu.height() > 300)
								menu.css({'height':'300px','overflow-y':'scroll'});
							if(e.pageY + menu.height() > (window.pageYOffset + window.innerHeight)){
									element.parent().removeClass('dropdown');
									element.parent().addClass('dropup');
							}
						}
					});
			}
		};
	}).directive('childScroll', function() {
		return{
			restrict: 'A',
			link: function(scope, element) {
				element.bind('mousewheel DOMMouseScroll', function(e) {
				    var scrollTo = null;

				    if (e.type === 'mousewheel') {
				        scrollTo = (e.originalEvent.wheelDelta * -1);
				    }
				    else if (e.type === 'DOMMouseScroll') {
				        scrollTo = 40 * e.originalEvent.detail;
				    }

				    if (scrollTo) {
				        e.preventDefault();
				        element.scrollTop(scrollTo + element.scrollTop());
				    }
				});
			}
		};
	}).directive('fixWidth',function(){
		return{
			restrict:'A',
			link:function(scope,element,attr){
				scope.$watch('cols',function(){
					var col_width = Math.floor(12/attr.fixWidth);
					if(col_width < 2) col_width = 2;
					element.addClass('col-md-'+col_width);
				},true);
			}
		};
	});
