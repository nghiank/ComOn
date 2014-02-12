'use strict';

(function() {
    describe('ACE controllers', function() {
        describe('IndexController', function() {
            // Load the controllers module
            beforeEach(module('ace','mockJson'));

            var scope, IndexController,httpBackend;

            beforeEach(inject(function($controller, $rootScope, $httpBackend, translator) {
                scope = $rootScope.$new();

                httpBackend = $httpBackend;
                $httpBackend.expectJSONP('/language/en.json').respond(translator);

                IndexController = $controller('IndexController', {
                    $scope: scope
                });
            }));

            it('should expose some global scope', function() {

                expect(scope.global).toBeTruthy();

            });
        });
    });
})();