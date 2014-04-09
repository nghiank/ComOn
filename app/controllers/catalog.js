'use strict';

var mongoose = require('mongoose');
var CatalogSchem = mongoose.model('Catalog');
var error = require('../utils/error');
var _ = require('underscore');

var convertToUpper = function(item) {
	if(_.isString(item))
		item.toUpperCase();
	else if(_.isArray(item))
	{
		for (var j = 0; j < item.length; j++) {
			item[j] = item[j].toUpperCase();
		}
	}
	else if(_.isObject(item))
	{
		for(var i in item)
			item[i] = item[i].toUpperCase();
	}
	return item;
};

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
				additionalInfo: convertToUpper(additionalInfo)
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
				additionalInfo: convertToUpper(info)
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
			return res.jsonp([]);
		res.jsonp(result);
	});
};

exports.getAllTypes = function(req, res) {
	CatalogSchem.distinct('type', {}, function(err, result) {
		if(err)
			return error.sendGenericError(res, 400, 'Error Encountered');
		if(result.length === 0)
			return res.jsonp([]);
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
	var MAX_LIMIT = 10000;
	var default_upper = 5000;
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
		var query = CatalogSchem.find(final_find).sort(sortCriteria).select(fields).skip(lower).limit(upper-lower);
		if(req.body.filters)
			query = query.hint(index_hint);
		query.lean().exec(function(err, entries) {
			if(err){
				return error.sendGenericError(res, 400, 'Error Encountered');
			}
			return res.jsonp({data: entries, range: {lower: lower, upper: upper}});
		});
	};
	var removeDuplicates = function(fields) {
		for(var index in fields) {
			var single = fields[index];
			if(single === 'manufacturer')
			{
				if(req.body.manufacturer)
				{
					if(req.body.manufacturer.trim().toUpperCase() === req.body.search.string.trim().toUpperCase())
					{
						fields.splice(index, 1);
						continue;
					}
				}
			}
			if(_.has(filters, single))
			{
				if(req.body.filters[single].trim().toUpperCase() === req.body.search.string.trim().toUpperCase())
					fields.splice(index, 1);
			}
		}
	};
	if(req.body.filters)
	{
		var all_filters = req.body.filters;
		var index = null;
		var filters = {};
		if(all_filters.catalog)
		{
			filters.catalog =  new RegExp(all_filters.catalog.toUpperCase());
			index = {'catalog': 1};
		}
		if(all_filters.manufacturer)
		{
			filters.manufacturer = new RegExp(all_filters.manufacturer.toUpperCase());
			if(!index)
				index = {'manufacturer': 1};
		}
		if(all_filters.assemblyCode)
		{
			filters.assemblyCode =  new RegExp(all_filters.assemblyCode.toUpperCase());
			if(!index)
				index = {'assemblyCode': 1};
		}
		if(all_filters.description)
		{
			filters['additionalInfo.description'] =  new RegExp(all_filters.description);
			if(!index)
				index = {'additionalInfo.description': 1, 'type.code': 1};
		}
		if(index)
			index_hint = index;
		filters['type.code'] = type;
		filterCriteria = filters;
	}
	var default_search = null;
	if(req.body.search && req.body.search.string)
	{
		default_search = [];
		var regex;
		var linkRegex = function(val) {
			var obj = {};
			obj[val] = regex;
			return obj;
		};
		var fieldsToSearch = _.filter(fields.split(' '), function(val) {
			var array_ignore = ['additionalInfo.recnum', 'additionalInfo.assemblyquantity', 'additionalInfo.assemblylist'];
			if(array_ignore.indexOf(val) > -1)
				return false;
			return true;
		});
		removeDuplicates(fieldsToSearch);
		var final_find = filterCriteria;
		final_find.$and = [];
		if(req.body.search.words && req.body.search.words.length !== 0)
		{
			for (var i = 0; i < req.body.search.words.length; i++) {
				var word = req.body.search.words[i];
				regex = new RegExp(word.trim().toUpperCase());
				var newOrWordSet = _.map(fieldsToSearch, linkRegex);
				final_find.$and.push({$or: newOrWordSet});
			}
		}
		if(req.body.search.exacts && req.body.search.exacts.length !== 0)
		{
			for (var j = 0; j < req.body.search.exacts.length; j++) {
				var one_exact = req.body.search.exacts[j];
				regex = new RegExp(one_exact.trim().toUpperCase());
				var newOrExactSet = _.map(fieldsToSearch, linkRegex);
				final_find.$and.push({$or: newOrExactSet});
			}
		}
		if(req.body.search.or && req.body.search.or.length !== 0)
		{
			for(var k = 0; k < req.body.search.or.length; k++)
			{
				var one_or = req.body.search.or[k];
				var newOrSet = [];
				for(var l = 0; l < one_or.length; l++)
				{
					regex = new RegExp(one_or[l].trim().toUpperCase());
					newOrSet.push(_.map(fieldsToSearch, linkRegex));
				}
				final_find.$and.push({$or: newOrSet});
			}
		}
		if(!req.body.total)
			find_function(final_find);
		else
			count_function(final_find);
		return;
	}
	if(req.body.total)
		return count_function(filterCriteria);
	find_function(filterCriteria);
};

exports.getCatalogEntryById = function(req,res){
	if(!req.body._id)
		return error.sendGenericError(res, 400, 'Error Encountered');
	CatalogSchem.findOne({_id:req.body._id}).exec(function(err,entry){
		if(err)
			return error.sendGenericError(res, 400, 'Error Encountered');
		if(!entry)
			return error.sendGenericError(res, 400, 'Error Encountered');
		res.jsonp(entry);
	});
};

exports.editCatalogEntry = function(req,res){
	var fetchedEntry, newEntry;
	if(!req.body.item)
		return error.sendGenericError(res, 400, 'Error Encountered');
	newEntry = req.body.item;
	if(!newEntry._id)
		return error.sendGenericError(res, 400, 'Error Encountered');
	CatalogSchem.findOne({_id:newEntry._id}).exec(function(err, entry){
		if(err)
			return console.log(err);
		if(!entry)
			return console.log(err);
		fetchedEntry = entry;
		if(fetchedEntry.type.code !== newEntry.type.code)
			fetchedEntry.additionalInfo = {};
		_.extend(fetchedEntry,newEntry);
		fetchedEntry.save(function(err){
			if(err)
				return console.log(err);
			console.log('saved');
			return res.jsonp(fetchedEntry);
		});
	});
};

exports.deleteCatalogEntry = function(req,res){
	if(!req.body._id)
		return error.sendGenericError(res, 400, 'Error Encountered');
	CatalogSchem.findOne({_id:req.body._id}).exec(function(err,entry){
		if (err)
			return error.sendGenericError(res, 400, 'Error Encountered');
		if (!entry)
			return error.sendGenericError(res, 400, 'Error Encountered');
		entry.remove(function(err){
			if(err)
				return error.sendGenericError(res, 400, 'Error Encountered');
			return res.jsonp(entry);
		});
	});
};

exports.checkUnique = function(req, res){
	if(!req.body.catalog || !req.body.manufacturer || typeof req.body.assemblyCode === 'undefined' || !req.body.type || !req.body._id){
		return error.sendGenericError(res, 400, 'Error Encountered');
	}
		
	CatalogSchem.find({catalog:req.body.catalog, manufacturer:req.body.manufacturer, assemblycode:req.body.assemblyCode}).exec(function(err, entry){
		if(err)
			return console.log(err);
		for(var i in entry){
			if(entry[i]._id !== req.body._id && entry[i].type.code === req.body.type.code)
				return res.jsonp({'unique':false});
		}
		return res.jsonp({'unique':true});
		
	});
};
