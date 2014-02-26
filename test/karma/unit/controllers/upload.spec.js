'use strict';

(function() {
	describe('ACE controllers', function() {
		describe('UploadController', function() {
		// Load the controllers module
			beforeEach(module('ace'));

			var scope, UploadController, Service, $httpBackend;

			beforeEach(inject(function($controller, $rootScope, $injector, Schematics) {
				
				scope = $rootScope.$new();
				Service = Schematics;
				$httpBackend = $injector.get('$httpBackend');
				$httpBackend.when('GET', 'api/getSchemStds').respond([{'name': 'IEC'}, {'name': 'JIC'}]);

				UploadController = $controller('UploadController', {
					$scope: scope,
					Schematics: Service
				});
			}));

			it('ensure name larger than 30 chars are caught', function(){
				scope.$digest();
				scope.stdName = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ';
				scope.checkName();
				expect(scope.valid.name).toBe(false);
			});

			it('ensures repetitive standard name are caught', function(){
				scope.stdName = 'IEC';
				scope.checkName();
				$httpBackend.flush();
				expect(scope.valid.name).toBe(false);
			});

			it('ensure valid name pass validaation', function(){
				scope.stdName = 'JIC New';
				scope.checkName();
				$httpBackend.flush();
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

			it('ensure invalid dat files (file name with .dat) are caught', function(){
				var datFile = [{'name':'sth.dat.exe'}];
				scope.checkDatFile(datFile);
				expect(scope.valid.dat).not.toBe(true);
			});

			it('ensure invalid dat files are caught', function(){
				var datFile = [{'name':'somethingstrange'}];
				scope.checkDatFile(datFile);
				expect(scope.valid.dat).not.toBe(true);
			});

			it('ensure valid dat files passes', function(){
				var datFile = [{'name':'sthvalid.dat'}];
				scope.checkDatFile(datFile);
				expect(scope.valid.dat).toBe(true);
			});

		});
	});
})();