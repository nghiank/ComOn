'use strict';

//service for validating links in a mapping file.
angular.module('ace.schematic').factory('ValidationService', ['$http', function($http) {
	var g_result = false;
	var dlList = [];
	var thumbnailList = [];
	var g_messages;
	var checked = 0;
	var total = 0;
	var status = true;
	var trial_number = 0;
	var escape_regex = function(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
	};

	var findThumbnail = function(thumbnail, mapping) {
		if(!mapping)
			return null;
		var first_brack = thumbnail.indexOf('(');
		var last_brack = thumbnail.indexOf(')');
		if(first_brack === -1 || last_brack === -1)
			return null;
		var location = thumbnail.substring(0, first_brack)+'/'+thumbnail.substring(first_brack+1, last_brack);
		var matchstring = '^.*'+escape_regex(location)+'\\.bmp$';
		var reg = new RegExp(matchstring, 'i');
		for (var i = mapping.length - 1; i >= 0; i--) {
			var json = mapping[i];
			if(reg.test(json.name))
			{
				return json.dl_url;
			}
		}
		return null;
	};

	var findDl = function(id, mapping) {
		if(!mapping)
			return null;
		var matchstring = '^.*'+escape_regex(id)+'\\.dwg$';
		var reg = new RegExp(matchstring, 'i');
		for (var i = mapping.length - 1; i >= 0; i--) {
			var json = mapping[i];
			if(reg.test(json.name))
			{
				return json.dl_url;
			}
		}
		return null;
	};


	var populateDlAndThumbnail = function(root, mapping, number, callback) {
		var total = 0, processed = 0;
		function isComposite(child) {
			if(!child.isComponent) {
				thumbnailList.push({'id': child.id, 'thumbnail': findThumbnail(child.thumbnail, mapping)});
				populateDlAndThumbnail(child, mapping, number, function() {
					if(++processed === total) {
						callback(null, number);
					}
				});
			}
			else {
				dlList.push({'id': child.component, 'dlurl': findDl(child.component, mapping)});
				thumbnailList.push({'id': child.component, 'thumbnail': findThumbnail(child.thumbnail, mapping)});
				if(++processed === total) {
					callback(null, number);
				}
			}
		}

		if(!root.isComponent)
		{
			if(root.children.length === 0)
				callback(null, number);
			else
			{
				total = root.children.length;
				for (var i = 0; i < root.children.length; i++) {
					isComposite(root.children[i]);
				}
			}

		}
		else
		{
			callback(new Error('Not a Sub-type'), number);
		}
	};

	var checkLinks = function(id, link, cb, number) {
		$http.get(link).success(function(){
			if(number === trial_number)
			{
				g_messages.push({'type': 'success', 'info': 'Link for '+id+' valid.'});
				checked++;
				if(checked === total)
				{
					if(!cb)
					{
						g_result = status;
						if(status)
							g_messages.push({'type': 'center-result alert alert-info', 'info': 'Validation Succeeded.'});
						else
							g_messages.push({'type': 'center-result alert alert-danger', 'info': 'Validation Failed'});
						return;
					}
					cb(number);

				}
			}
		}).error(function() {
			if(number === trial_number)
			{
				status = false;
				g_messages.push({'type': 'error', 'info': 'Link for '+id+' invaild.'});
				checked++;
				if(checked === total)
				{
					if(!cb)
					{
						g_result = status;
						if(status)
							g_messages.push({'type': 'center-result alert alert-info', 'info': 'Validation Succeeded.'});
						else
							g_messages.push({'type': 'center-result alert alert-danger', 'info': 'Validation Failed'});
						return;
					}
					cb(number);
				}
			}
		});
	};

	var startThumnailCheck = function(number) {
		g_messages.push({'type': 'center-result alert alert-info', 'info': 'Starting validation of Thumbnail links.....'});
		checked = 0;
		total = thumbnailList.length;
		for (var i = thumbnailList.length - 1; i >= 0; i--) {
			var item = thumbnailList[i];
			if(number === trial_number)
			{
				if(!item.thumbnail)
				{
					checked++;
					g_messages.push({'type': 'error', 'info': 'Thumbnail link for '+item.id+' not found.'});
					if(checked === total)
					{
						g_result = status;
						if(status)
							g_messages.push({'type': 'center-result alert alert-info', 'info': 'Validation Succeeded.'});
						else
							g_messages.push({'type': 'center-result alert alert-danger', 'info': 'Validation Failed'});
						return;
					}
					continue;
				}
				checkLinks(item.id, item.thumbnail, null, number);
			}
		}
	};

	var startDownloadCheck = function(err, number) {
		if(err)
		{
			return g_messages.push({'type': 'error', 'info': 'Validation failed.'});
		}
		total = dlList.length;
		g_messages.push({'type': 'center-result alert alert-info', 'info': 'Starting validation of Download links.....'});
		for (var i = dlList.length - 1; i >= 0; i--) {
			var item = dlList[i];
			if(number === trial_number)
			{
				if(!item.dlurl)
				{
					checked++;
					g_messages.push({'type': 'error', 'info': 'Download link for '+item.id+' not found.'});
					if(checked === total)
					{
						return startThumnailCheck(number);
					}
					continue;
				}
				checkLinks(item.id, item.dlurl, startThumnailCheck, number);
			}
		}
	};

	var instance = {
		reset: function() {
			checked = 0;
			total = 0;
			g_messages = [];
			dlList = [];
			thumbnailList = [];
			g_result = false;
			status = true;
		},
		messages: function() { return g_messages; },
		validateLinks: function(data, mapping) {
			this.reset();
			var number = ++trial_number;
			populateDlAndThumbnail(data, JSON.parse(mapping), number, startDownloadCheck);
		},
		result: function() { return g_result; }
	};
	return instance;
}]);