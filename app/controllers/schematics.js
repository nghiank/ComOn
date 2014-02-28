'use strict';

var parser = require('../utils/ParserDat');
var Inst = new parser();
var mongoose = require('mongoose');
var ComponentSchem = mongoose.model('SchematicComponent');
var StandardSchem = mongoose.model('SchematicStandard');
var error = require('../utils/error');
var formidable = require('formidable');
var fs = require('fs');
var g_mapping;

var populateComponents;

var escape_regex = function(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

var findThumbnail = function(thumbnail) {
	if(!g_mapping)
		return null;
	var first_brack = thumbnail.indexOf('(');
	var last_brack = thumbnail.indexOf(')');
	if(first_brack === -1 || last_brack === -1)
		return null;
	var location = thumbnail.substring(0, first_brack)+'/'+thumbnail.substring(first_brack+1, last_brack);
	var matchstring = '^.*'+escape_regex(location)+'\\.bmp$';
	var reg = new RegExp(matchstring, 'i');
	for (var i = g_mapping.length - 1; i >= 0; i--) {
		var json = g_mapping[i];
		if(reg.test(json.name))
		{
			return json.dl_url;
		}
	}
	return null;
};

var findDl = function(id) {
	if(!g_mapping)
		return null;
	var matchstring = '^.*'+escape_regex(id)+'\\.dwg$';
	var reg = new RegExp(matchstring, 'i');
	for (var i = g_mapping.length - 1; i >= 0; i--) {
		var json = g_mapping[i];
		if(reg.test(json.name))
		{
			return json.dl_url;
		}
	}
	return null;
};

var createComponent = function(child, parent, std) {
	var component = new ComponentSchem({
		name: child.isComponent? child.name: child.title,
		parentNode: parent,
		id: child.isComponent? child.component: child.id,
		standard: std,
		thumbnail: (child.thumbnail === 'none')? null: findThumbnail(child.thumbnail),
		dl: child.isComponent? findDl(child.component): null,
		acad360l: null,
		isComposite: !child.isComponent
	});
	component.save(function(err) {
		if(err) return console.log(err);
		if(component.isComposite)
			populateComponents(child.children, component._id, std);
	});
};

var populateComponents = function(children, parent, std) {
	for (var i = children.length - 1; i >= 0; i--) {
		var child = children[i];
		createComponent(child, parent, std);
	}
};

var populateSchematic = function(res, root, fields) {
	var standard = new StandardSchem({
		name: root.title,
		description: fields.description
	});
	standard.save(function(err) {
		if(err) {
			return error.sendGenericError(res, 400, 'Error Encountered');
		}
		var standardId = standard._id;
		populateComponents([root], null, standardId);
		return res.send(200);
	});
};

var parseFiles = function(res, fields, files) {
	if(!files)
		return error.sendGenericError(res, 400, 'Error Encountered');
	var jsonBuffer = fs.readFileSync(files.jsonFile.path, 'utf8');
	var datBuffer = fs.readFileSync(files.datFile.path, 'utf8');
	g_mapping = JSON.parse(jsonBuffer);
	var parse_result = Inst.parse(datBuffer);
	var generate_result = Inst.generateSubMenuHierachy();
	if(parse_result !== 'Success' || generate_result!== 'Success')
		return error.sendGenericError(res, 400, 'Error Encountered');
	var root = Inst.rootNode;
	populateSchematic(res, root, fields);
};

var deleteChildren = function(id) {
	ComponentSchem
		.findOne({_id: id})
		.exec(function(err, component) {
			if(err)
				return console.log(err);
			if(!component.parentNode)
			{
				StandardSchem
					.findOne({name: component.name})
					.exec(function(err, standard) {
						if(err)
							return console.log(err);
						standard.remove();
					});
			}
			if(component.isComposite)
			{
				ComponentSchem
					.find({parentNode: component._id})
					.exec(function(err, children) {
						if (err) {
							return console.log(err);
						}
						for (var i = children.length - 1; i >= 0; i--) {
							deleteChildren(children[i]._id);
						}
					});
			}
			component.remove();
		});
};

exports.receiveFiles = function(req, res) {
	var form = new formidable.IncomingForm();
    return form.parse(req, function(err, fields, files) {
		if(err)
			return error.sendGenericError(res, 400, 'Error Encountered');
		if(!files.jsonFile || !files.datFile)
			return error.sendGenericError(res, 400, 'Error Encountered');
		return parseFiles(res, fields, files);
    });
};


exports.getNodeChildren = function(req, res) {
	if(!req.node)
	{
		return error.sendGenericError(res, 400, 'Error Encountered');
	}
	var id = req.node._id;
	ComponentSchem
		.find({parentNode: id})
		.populate('standard')
		.populate('parentNode')
		.exec(function(err, components) {
			if(err)
				return error.sendGenericError(res, 400, 'Error Encountered');
			return res.jsonp({'children': components});
		});
};

exports.delete = function(req, res) {
	if(!req.node)
	{
		return error.sendGenericError(res, 400, 'Error Encountered');
	}
	deleteChildren(req.node._id);
};

exports.getParentHiearchy = function(req, res) {
	if(!req.node)
	{
		return error.sendGenericError(res, 400, 'Error Encountered');
	}
	var list = [];
	var parent = req.node.parentNode;
	list.push({'title': req.node.name, 'link': req.node._id});
	if(parent === null)
	{
		return res.jsonp({'parentHiearchy': list});
	}
	(function genHiearchy(parentId) {
		ComponentSchem
		.findOne({_id: parentId})
		.exec(function(err, component) {
			if(err)
				return error.sendGenericError(res, 400, 'Error Encountered');
			list.push({'title': component.name, 'link': component._id});
			if(component.parentNode)
			{
				genHiearchy(component.parentNode);
			}
			else
			{
				console.log('asdasda   ', list);
				return res.jsonp({'parentHiearchy': list.reverse()});
			}
		});
	})(parent);
};


exports.getAllSchemStds = function(req, res) {
	ComponentSchem
		.find({
			parentNode: null
		})
		.populate('standard')
		.exec(function(err, components) {
            if (err)
				return error.sendGenericError(res, 400, 'Error Encountered');
			return res.jsonp(components);
		});
};


exports.node = function(req, res, next, id) {
    ComponentSchem
        .findOne({
            _id: id,
            isComposite: true
        })
		.exec(function(err, component) {
            if (err)
				return error.sendGenericError(res, 400, 'Error Encountered');
            if (!component)
				return error.sendGenericError(res, 400, 'Error Encountered');
            req.node = component;
            next();
        });
};

