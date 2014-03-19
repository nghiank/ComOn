'use strict';

var mongoose = require('mongoose');
var CatalogSchem = mongoose.model('Catalog');
var error = require('../utils/error');
var _ = require('underscore');

var createEntry = function(entry, catalog, typeName, typeCode) {
	CatalogSchem.findOne({catalog: catalog, assemblyCode: null, manufacturer: entry.manufacturer, typeCode: typeCode}).exec(function(err, fetchedEntry) {
		if(err)
			return console.log(err);
		if(!fetchedEntry)
		{
			var additionalInfo = _.omit(entry, ['catalog', 'manufacturer']);
			var newEntry = new CatalogSchem({
				catalog: catalog,
				manufacturer: entry.manufacturer,
				typeCode: typeCode,
				typeName: typeName,
				assemblyCode: null,
				additionalInfo: additionalInfo
			});
			newEntry.save(function(err) {
				if(err)
					return console.log(err);
			});
		}
		else{
			var info = _.omit(entry, ['catalog', 'manufacturer']);
			var replacingEntry = {
				catalog: catalog,
				manufacturer: entry.manufacturer,
				typeCode: typeCode,
				typeName: typeName,
				assemblyCode: null,
				additionalInfo: info
			};
			_.extend(fetchedEntry, replacingEntry);
			fetchedEntry.save(function(err) {
				if(err)
					return console.log(err);
			});
		}
	});
};

exports.populateCatalog = function(req, res) {
	if(!req.body.data)
	{
		return error.sendGenericError(res, 400, 'Error Encountered');
	}
	var data = req.body.data;
	function nextColumn(column)
	{
		var length = column.join('').length;
		function repeatChar(count, ch) {
			if (count === 0) {
				return '';
			}
			var count2 = count / 2;
			var result = ch;
			while (result.length <= count2) {
				result += result;
			}
			var finalResult = result + result.substring(0, count - result.length);
			return finalResult;
		}
		function getNextAlphabet(char) {
			return String.fromCharCode(char.charCodeAt(0)+1);
		}
		var endString = repeatChar(length, 'Z');
		if(column.join('') === endString)
			return repeatChar(length+1, 'A');
		if(column[length - 1] === 'Z')
		{
			var index = 1;
			while(length >= index && column[length - index] === 'Z')
			{
				column[length-index] = 'A';
				if(length > index && column[length-index-1] === 'Z')
				{
					index++;
				}
				else
				{
					column[length-index-1] = getNextAlphabet(column[length-index-1]);
					break;
				}
			}
		}
		else
		{
			column[length-1] = getNextAlphabet(column[length-1])[0];
		}
		return column.join('');
	}
	_.each(data, function(value, key) {
		if(!key || !value.title)
			return;
		var typeCode = key.toString();
		var typeName = value.title.toString();
		for (var i = 0; i < value.data.length; i++) {
			var column = 'A';
			for(var j=0 ;j< 50;j++)
			{
				var entry = value.data[i];
				var catalog = entry.catalog.replace(' ','');
				catalog += column;
				createEntry(entry, catalog, typeName, typeCode);
				column = nextColumn(column.split(''));
			}
/*			var entry = value.data[i];
			var catalog = entry.catalog.replace(' ','');
			createEntry(entry, catalog, typeName, typeCode);*/
		}

	});
	res.send(200);
};

exports.getCatalogEntries = function(req, res) {
	if(!req.body.type) {
		return error.sendGenericError(res, 400, 'Error Encountered');
	}
	var type = req.body.type;
	var MAX_LIMIT = 1000;
	var lower = req.body.lower? req.body.lower: 0;
	var searchCriteria = {typeCode: type};
	var searchString = req.body.search? req.body.search: '';
	if(req.body.manufacturer)
		searchCriteria.manufacturer = req.body.manufacturer;
	(function search(start) {
		CatalogSchem.find(searchCriteria).skip(start).limit(MAX_LIMIT).exec(function(err, entries) {
			if(err)
				return error.sendGenericError(res, 400, 'Error Encountered');
			var nextIndex = false;
			if(!searchString)
			{
				if(entries.length > (MAX_LIMIT))
					nextIndex = true;
				return res.jsonp({data: entries, nextIndex: nextIndex});
			}
			var filteredEntries = _.filter(entries, function(item) {
				return JSON.stringify(item).toLowerCase().indexOf(searchString.toLowerCase()) > -1;
			});
			if(filteredEntries.length > (MAX_LIMIT))
				nextIndex = true;
			res.jsonp({data: filteredEntries, nextIndex: nextIndex});
		});
	})(lower);
};
