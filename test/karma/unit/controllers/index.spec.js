'use strict';

(function() {
    describe('ACE controllers', function() {
        describe('IndexController', function() {
            // Load the controllers module
            beforeEach(module('ace','mockJson'));

            var scope, IndexContro;

            beforeEach(inject(function($controller, $rootScope) {
                scope = $rootScope.$new();
                });
            }));

            it('should expose some global scope', function() {

                expect(scope.global).toBeTruthy();

            });
        });
    });
})();