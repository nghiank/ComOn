'use strict';

(function() {
	describe('ACE controllers', function() {
		describe('filterModalCtrl', function() {
		// Load the controllers module
			beforeEach(module('ace'));

			var scope, UploadController, $httpBackend, modalInstance, data;

			beforeEach(inject(function($controller, $rootScope, $injector, UsersAPI) {
				
				scope = $rootScope.$new();
				$httpBackend = $injector.get('$httpBackend');
				//$httpBackend.expect('POST','api/addFilter').respond(200);
				data = {'filters': {}, 'type': {'name':'Fuses','code':'FU'}, 'search': {}};

				UploadController = $controller('filterModalCtrl', {
					$scope: scope,
					UsersAPI: UsersAPI,
					$modalInstance:modalInstance,
					data:data
				});
			}));

			afterEach(function() {
					$httpBackend.verifyNoOutstandingExpectation();
					$httpBackend.verifyNoOutstandingRequest();
				});

			it('should start with save button disabled', function(){
				expect(scope.saveDisabled).toEqual(true);
			});

		});
	});
})();