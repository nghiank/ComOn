'use strict';

//Global service for global variables
angular.module('ace.system').factory('formValidation', ['SchematicsAPI',function(SchematicsAPI) {
		var instance = {};
		instance.checkFileExtension = function (file, extensions) {
			if(!file || !extensions)
				return {result: false, suc_message: null, err_message: 'Invalid file.'};
			var stringExtension = extensions.join('|');
			var pattern = new RegExp('^.*\\.('+stringExtension+')$');
			if(pattern.test(file))
				return {result: true, suc_message: 'Valid file.', err_message: null};
			else
				return {result: false, suc_message: null, err_message: 'Invalid file type.'};
		};

		instance.checkStandardName = function(name, cb) {
			if(name.length > 30)
				return cb({result: false, suc_message: null, err_message: 'Name too long.'});
			SchematicsAPI.standardlist.query(function(stds) {
				if(stds){
					var localName = name.toUpperCase();
					for (var i = 0; i < stds.length; i++){
						var dbName = stds[i].name.toUpperCase();
						if(dbName.localeCompare(localName) === 0){
							return cb({result: false, suc_message: null, err_message: 'A standard with that name already exists.'});
						}
					}
				}
				return cb({result: true, suc_message: 'Valid Name.', err_message: null});
			});
		};
		return instance;
	}
]);
