'use strict';

var mongoose = require('mongoose');
var CatalogSchem = mongoose.model('Catalog');
var error = require('../utils/error');
var _ = require('underscore');

var createEntry = function(entry, typeName, typeCode) {
	CatalogSchem.findOne({catalog: entry.catalog, manufacturer: entry.manufacturer, typeCode: typeCode}).exec(function(err, fetchedEntry) {
		if(err)
			return console.log(err);
		if(!fetchedEntry)
		{
			var additionalInfo = _.omit(entry, ['catalog', 'manufacturer']);
			var newEntry = new CatalogSchem({
				catalog: entry.catalog,
				manufacturer: entry.manufacturer,
				typeCode: typeCode,
				typeName: typeName,
				additionalInfo: additionalInfo
			});
			newEntry.save(function(err) {
				if(err)
					return console.log(err);
			});
		}
		else{
			_.extend(fetchedEntry, entry);
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
	_.each(data, function(value, key) {
		if(!key || !value.title)
			return;
		var typeCode = key;
		var typeName = value.title;
		for (var i = 0; i < value.data.length; i++) {
			var entry = value.data[i];
			entry.catalog = entry.catalog.replace(' ','');
			createEntry(entry, typeName, typeCode);
		}

	});
	res.send(200);
};

exports.getCatalogEntries = function(req, res) {
	if(!req.body.type) {
		return error.sendGenericError(res, 400, 'Error Encountered');
	}
	var type = req.body.type;
	var upper = req.body.upper? req.body.upper: 10000;
	var lower = req.body.lower? req.body.lower: 0;
	if(upper < lower)
	{
		upper = upper + lower;
		lower = upper - lower;
		upper = upper - lower;
	}
	if(upper - lower > 10000)
		upper = lower + 10000;
	var searchCriteria = {typeCode: type};
	if(req.body.manufacturer)
		searchCriteria.manufacturer = req.body.manufacturer;
	CatalogSchem.find(searchCriteria).skip(lower).limit(upper-lower).exec(function(err, entries) {
		if(err)
			return error.sendGenericError(res, 400, 'Error Encountered');
		res.jsonp(entries);
	});
};
