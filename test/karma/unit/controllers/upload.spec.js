'use strict';

(function() {
	describe('ACE controllers', function() {
		describe('UploadController', function() {
		// Load the controllers module
			beforeEach(module('ace'));

			var scope, UploadController, $httpBackend;

			beforeEach(inject(function($controller, $rootScope, $injector) {
				$httpBackend = $injector.get('$httpBackend');
				$httpBackend.when('POST', 'api/upload').respond({'status':'Success'});

				scope = $rootScope.$new();

				UploadController = $controller('UploadController', {
					$scope: scope
				});
			}));

			it('ensure name larger than 30 chars are caught', function(){
				scope.$digest();
				scope.stdName = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ';
				scope.checkName();
				expect(scope.valid.name).toBe(false);
			});

			it('ensure valid name pass validaation', function(){
				scope.stdName = 'IEC';
				scope.checkName();
				expect(scope.valid.name).toBe(true);
			});

			it('ensure invalid path to mapping json files are caught', function(){
				var jsonFile = [{'name':'something.exe'}];
				scope.jsonFileSelect(jsonFile);
				expect(scope.valid.json).not.toBe(true);
			});

			it('ensure invalid path to mapping json files (file name with .json) are caught', function(){
				var jsonFile = [{'name':'sth.json.exe'}];
				scope.jsonFileSelect(jsonFile);
				expect(scope.valid.json).not.toBe(true);
			});

			it('ensure valid path to mapping jason file passes', function(){
				var jsonFile = [{'name':'something/file.json'}];
				scope.jsonFileSelect(jsonFile);
				expect(scope.valid.json).toBe(true);
			});




		});
	});
})();