'use strict';

//Global service for global variables
angular.module('ace.system').factory('Global', [
	function() {
		var _this = this;
		_this._data = {
			user: window.user,
			authenticated: !! window.user,
			setFav: function(list) {
				if(!!window.user)
					window.user.SchemFav = list;
			}
		};

		return _this._data;
	}
]);
