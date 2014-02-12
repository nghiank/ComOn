'use strict';

(function() {
    describe('ACE controllers', function() {
        describe('HeaderController', function() {
            // Load the controllers module
            beforeEach(module('ace','mockJson'));

            var scope, HeaderController, httpBackend;

            beforeEach(inject(function($controller, $rootScope, $httpBackend, translator) {
                scope = $rootScope.$new();

                httpBackend = $httpBackend;
                $httpBackend.when('GET','/language/en.json').respond(translator);

                HeaderController = $controller('HeaderController', {
                    $scope: scope
                });
            }));

            it('should expose some global scope', function() {

                expect(scope.global).toBeTruthy();

            });
        });
    });
})();