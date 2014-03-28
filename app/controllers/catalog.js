'use strict';

var mongoose = require('mongoose');
var CatalogSchem = mongoose.model('Catalog');
var error = require('../utils/error');
var _ = require('underscore');

var createEntry = function(entry, catalog, typeName, typeCode) {
	CatalogSchem.findOne({catalog: catalog, assemblyCode: null, manufacturer: entry.manufacturer, 'type.code': typeCode}).exec(function(err, fetchedEntry) {
		if(err)
			return console.log(err);
		if(!fetchedEntry)
		{
			var additionalInfo = _.omit(entry, ['catalog', 'manufacturer']);
			var newEntry = new CatalogSchem({
				catalog: catalog.toUpperCase(),
				manufacturer: entry.manufacturer.toUpperCase(),
				type: {code: typeCode.toUpperCase(), name: typeName},
				assemblyCode: entry.assemblycode? entry.assemblycode.toUpperCase(): null,
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
				catalog: catalog.toUpperCase(),
				manufacturer: entry.manufacturer.toUpperCase(),
				type: {code: typeCode.toUpperCase(), name: typeName},
				assemblyCode: entry.assemblycode? entry.assemblycode.toUpperCase(): null,
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
	var user = req.user;
	function checkAuthority(manufacturerEntry)
	{
		return user.isAdmin? true: (user.codeName.toLowerCase() === manufacturerEntry.toLowerCase());
	}
/*	function nextColumn(column)
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
	}*/
	_.each(data, function(value, key) {
		if(!key || !value.title)
			return;
		var typeCode = key.toString();
		var typeName = value.title.toString();
		for (var i = 0; i < value.data.length; i++) {
/*			var column = 'CAA';
			console.log(i);
			for(var j=0 ;j< 200;j++)
			{
				var entry = value.data[i];
				var catalog = entry.catalog.replace(' ','');
				catalog += column;
				if(checkAuthority(entry.manufacturer.trim()))
				{
					createEntry(entry, catalog, typeName, typeCode);
					column = nextColumn(column.split(''));
				}
			}*/
			var entry = value.data[i];
			var catalog = entry.catalog.replace(' ','');
			if(checkAuthority(entry.manufacturer.trim())){
				createEntry(entry, catalog, typeName, typeCode);
			}
		}

	});
	res.send(200);
};

exports.getAllUniqueValues = function(req, res) {
	if(!req.body.field || !req.body.type)
	{
		return error.sendGenericError(res, 400, 'Error Encountered');
	}
	CatalogSchem.distinct(req.body.field.toLowerCase(), {'type.code': req.body.type}, function(err, result) {
		if(err)
			return error.sendGenericError(res, 400, 'Error Encountered');
		if(result.length === 0)
			res.jsonp([]);
		res.jsonp(result);
	});
};

exports.getAllTypes = function(req, res) {
	CatalogSchem.distinct('type', {}, function(err, result) {
		if(err)
			return error.sendGenericError(res, 400, 'Error Encountered');
		if(result.length === 0)
			res.jsonp([]);
		res.jsonp(result);
	});
};

exports.getAllFields = function(req, res) {
	if(!req.body.type) {
		return error.sendGenericError(res, 400, 'Error Encountered');
	}
	var type = req.body.type;
	CatalogSchem.findOne({'type.code': type}).lean(true).exec(function(err, entry) {
		if(err)
			return error.sendGenericError(res, 400, 'Error Encountered');
		if(!entry)
			return error.sendGenericError(res, 400, 'Error Encountered');
		var fields = _.keys(_.omit(entry, ['additionalInfo', '_id', '__v']));
		var additionalInfo = _.keys(entry.additionalInfo);
		fields = _.union(fields, _.map(additionalInfo, function(key) { return 'additionalInfo.'+key; }));
		res.jsonp(fields);
	});
};

exports.getCatalogEntries = function(req, res) {
	if(!req.body.type) {
		return error.sendGenericError(res, 400, 'Error Encountered');
	}
	var type = req.body.type;
	var MAX_LIMIT = 5000;
	var default_upper = 1000;
	var lower = req.body.lower? req.body.lower: 0;
	var upper = req.body.upper? req.body.upper: lower+default_upper;
	var fields = req.body.fields? req.body.fields: ' catalog manufacturer assemblyCode ';
	var index_hint = {'type.code': 1};
	if(upper < lower)
	{
		upper = upper + lower;
		lower = upper - lower;
		upper = upper - lower;
	}
	if(upper - lower > MAX_LIMIT)
		upper = lower + default_upper;
	var filterCriteria = {'type.code': type};
	var sortCriteria = {};
	if(req.body.sortField)
	{
		var field = req.body.sortField.field;
		var sort = req.body.sortField.sort;
		sortCriteria[field] = sort;
	}
	var count_function = function(final_find) {
		CatalogSchem.count(final_find).exec(function(err, count) {
			if(err){
				return error.sendGenericError(res, 400, 'Error Encountered');
			}
			return res.jsonp({count: count});
		});
	};
	var find_function = function(final_find) {
		CatalogSchem.find(final_find).sort(sortCriteria).select(fields).skip(lower).limit(upper-lower).hint(index_hint).lean().exec(function(err, entries) {
			if(err){
				return error.sendGenericError(res, 400, 'Error Encountered');
			}
			return res.jsonp({data: entries, range: {lower: lower, upper: upper}});
		});
	};
	if(req.body.filters)
	{
		var all_filters = req.body.filters;
		var index = null;
		if(all_filters.catalog)
		{
			filterCriteria.catalog =  new RegExp('^'+all_filters.catalog.toUpperCase());
			index = {'catalog': 1};
		}
		if(all_filters.manufacturer)
		{
			filterCriteria.manufacturer = new RegExp(all_filters.manufacturer.toUpperCase());
			if(!index)
				index = {'manufacturer': 1};
		}
		if(all_filters.assemblyCode)
		{
			filterCriteria.assemblyCode =  new RegExp(all_filters.assemblyCode, 'i');
			if(!index)
				index = {'assemblyCode': 1};
		}
		if(all_filters.description)
		{
			filterCriteria['additionalInfo.description'] =  new RegExp(all_filters.description, 'i');
		}
		if(index)
			index_hint = index;
	}
/*	var default_search = null;
	if(req.body.search)
	{
		default_search = [];
		var regex = new RegExp(req.body.search.trim(), 'i');
		if(!req.body.manufacturer)
			default_search.push({manufacturer: regex});
		default_search.push({catalog: regex});
		default_search.push({assemblyCode: regex});
		CatalogSchem.findOne({'type.code': type}).exec(function(err, entry) {
			if(err)
				return error.sendGenericError(res, 400, 'Error Encountered');
			if(!entry)
				return res.jsonp({data: [], range: {lower: lower, upper: upper}, total: 0});
			var search_fields = _.keys(_.pick(entry, 'additionalInfo').additionalInfo);
			for (var i = search_fields.length -1 ; i >=0 ; i--) {
				var newEntry = {};
				newEntry['additionalInfo.'+search_fields[i]] = regex;
				default_search.push(newEntry);
			}
			var final_find = filterCriteria;
			if(default_search)
				final_find.$or = default_search;
			if(!req.body.total)
				find_function(final_find);
			else
				count_function(final_find);
		});
		return;
	}*/
	if(req.body.total)
		return count_function(filterCriteria);
	find_function(filterCriteria);
};
