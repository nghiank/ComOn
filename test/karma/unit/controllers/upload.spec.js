'use strict';

(function() {
	describe('ACE controllers', function() {
		describe('UploadController', function() {
		// Load the controllers module
			beforeEach(module('ace'));

			var scope, UploadController;

			beforeEach(inject(function($controller, $rootScope) {
				scope = $rootScope.$new();

				UploadController = $controller('UploadController', {
					$scope: scope
				});
			}));

			it('ensure name larger than 15 chars are caught', function(){
				scope.$digest();
				scope.stdName = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
				scope.checkName();
				expect(scope.valid.name).toBe(false);
			});

			it('ensure valid name pass validaation', function(){
				scope.stdName = 'IEC';
				scope.checkName();
				expect(scope.valid.name).toBe(true);
			});

			it('ensure invalid path to dat file are caught', function(){
				var files = [{'name':'sth.exe'}];
					scope.datFileSelect(files);
					expect(scope.valid.dat).not.toBe(true);				
			});

			it('ensure invalid path (file name with .dat) to dat file are caught', function(){
				var files = [{'name':'sth.dat.js'}];
					scope.datFileSelect(files);
					expect(scope.valid.dat).not.toBe(true);				
			});

			it('ensure valid path to dat file pass validation', function(){
				var file = [{'name':'sth.dat'}];
				scope.datFileSelect(file);
				expect(scope.valid.dat).toBe(true);
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