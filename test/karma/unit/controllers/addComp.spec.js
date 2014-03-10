'use strict';

(function() {
	describe('ACE controllers', function() {
		describe('AddCompFormCtrl', function() {
		// Load the controllers module
			beforeEach(module('ace'));

			var scope, UploadController, Service, $httpBackend, modalInstance,parent;

			beforeEach(inject(function($controller, $rootScope, $injector, Schematics) {
				
				scope = $rootScope.$new();
				Service = Schematics;
				$httpBackend = $injector.get('$httpBackend');
				$httpBackend.when('GET', 'api/getChildren/1').respond(200,{'children': [{'name': 'PB','id':'M0'}, {'name': 'Switch','id':'M1'}]});
				$httpBackend.when('GET','http://invalid.bmp').respond(302);
				parent = { 'name' :'IEEE: Solenoids', 'parentNode' : '53168932e8f493000024bc4a', 'id' : 'M24', 'standard' : '53168932e8f493000024bc49', '_id' : '1', 'isComposite' : true, 'dl' : null, 'acad360l' : null, 'thumbnail' : 'https://dl.dropboxusercontent.com/s/t1mrbs8ijos53gr/s_sv.bmp', '__v' : 0 };

				UploadController = $controller('addCompFormCtrl', {
					$scope: scope,
					Schematics: Service,
					$modalInstance:modalInstance,
					parent:parent
				});
			}));

			it('ensures repetitive component name are caught', function(){
				var names = ['Pb','PB','SwitcH'];
				for (var name in names){
					scope.target.name = name;
					scope.checkName();
					expect(scope.valid.name).not.toEqual(true);
				}
			});

			it('ensures valid component name passes validation', function(){
				var names = ['SomethingNew','Sth New', 'Sth: New'];
				for (var index in names){
					var name = names[index];
					scope.target.name = name;
					console.log('name:',name);
					console.log('parent:',parent);
					scope.checkName();
					$httpBackend.flush();
					expect(scope.valid.name).toEqual(true);
				}
			});

			it('ensures ids are checked on the server side',function(){
				scope.target.id = 'M0';
				scope.checkId();
				$httpBackend.expectGET('api/isUniqueId');
			});

			it('ensures non-bmp file link to thumbnail files are caught',function(){
				var thumbnails = ['https://dl.dropboxusercontent.com/s/rx4be2kya1bxu38/_np_nt.dat','...png'];
				for (var tn in thumbnails){
					scope.target.thumbnail = tn;
					scope.validateThumbnail();
					expect(scope.valid.thumbnail).not.toEqual(true);
				}
			});

			it('ensures broken linkes to thumbnail files are caught', function(){
				var thumbnail = 'http://invalid.bmp';
				scope.target.thumbnail = thumbnail;
				scope.validateThumbnail();
				setTimeout(function() {expect(scope.valid.thumbnail).not.toEqual(true);}, 100);
			});

			it('ensures valid link to thumbnail passes validation',function(){
				$httpBackend.expectGET('http://www.abcd.com/valid.bmp').respond(200, '');
				var thumbnail = 'http://www.abcd.com/valid.bmp';
				scope.target.thumbnail = thumbnail;
				scope.validateThumbnail();
				setTimeout(function() {expect(scope.valid.thumbnail).toEqual(true);}, 100);
			});

			it('ensures non-dwg file link to "download link" are caught',function(){
				var dls = ['https://dl.dropboxusercontent.com/s/rx4be2kya1bxu38/_np_nt.bmp','http://valid.bmp'];
				for (var dl in dls){
					scope.target.dl = dl;
					scope.validateDwg();
					expect(scope.valid.dl).not.toEqual(true);
				}
			});

			it('ensures broken linkes to "download link" are caught', function(){
				var dl = 'http://invalid.dwg';
				scope.target.dl = dl;
				scope.validateDwg();
				setTimeout(function() {expect(scope.valid.dl).not.toEqual(true);}, 100);
			});

			it('ensures valid link to "download link" passes validation',function(){
				scope.target.dl = 'http://valid.dwg';
				$httpBackend.expectGET('http://valid.dwg').respond(200, '');
				scope.validateDwg();
				setTimeout(function() {expect(scope.valid.dl).toEqual(true);}, 100);
			});

		});
	});
})();