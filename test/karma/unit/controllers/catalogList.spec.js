'use strict';

(function() {
	describe('ACE controllers', function() {
		describe('CatalogListCtrl', function() {
		// Load the controllers module
			beforeEach(module('ace'));

			var scope, addCatCtrl, Service, $httpBackend;

			beforeEach(inject(function($controller, $rootScope, $injector, CatalogAPI) {
				
				scope = $rootScope.$new();
				Service = CatalogAPI;
				$httpBackend = $injector.get('$httpBackend');
				addCatCtrl = $controller('catalogListCtrl',{
					$scope: scope,
					CatalogAPI: Service
				});
			}));
			

			afterEach(function() {
				$httpBackend.verifyNoOutstandingExpectation();
				$httpBackend.verifyNoOutstandingRequest();
			});

			it('should ensure the type list is shown and others hidden by default', function(){
				$httpBackend.expect('GET','api/getTypes').respond(200,[{'name':'Fuses','code':'FU'}]);
				scope.init();
				expect(scope.showTypes).toBe(true);
				expect(scope.searchBox.show).toBe(false);
				expect(scope.showList).toBe(false);
				$httpBackend.flush();
			});

			it('should ensure the search box is reset and shown when new type is selected', function(){				
/*				$httpBackend.expect('POST','api/getTypeFields').respond(200,['catalog','manufacturer']);
				$httpBackend.expect('POST','api/getEntries').respond(200,{});
				scope.showTypeList({'name':'Fuses','code':'FU'});
				expect(scope.searchBox.show).toBe(true);
				expect(scope.searchText).toEqual({});
				$httpBackend.flush();*/
			});

			it('should get the total number of results when the first page is load', function(){
			
			});

			it('should map data to the correct columns when fields are toggled on',function(){

			});

		});
	});
})();