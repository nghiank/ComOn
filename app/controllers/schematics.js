'use strict';

var parser = require('../utils/ParserDat');
var Inst = new parser();
var mongoose = require('mongoose');
var ComponentSchem = mongoose.model('SchematicComponent');
var StandardSchem = mongoose.model('SchematicStandard');
var error = require('../utils/error');
var formidable = require('formidable');
var fs = require('fs');

var populateComponents;

var createComponent = function(child, parent, std) {
	var component = new ComponentSchem({
		name: child.isComponent? child.name: child.title,
		parentNode: parent,
		id: child.isComponent? child.component: child.id,
		standard: std,
		thumbnail: (child.thumbnail === 'none')? null: child.thunbnail,
		dl: null,
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

var populateSchematic = function(res, root) {
	var standard = new StandardSchem({
		name: root.title,
	});
	standard.save(function(err) {
		if(err) {
			return error.sendGenericError(res, 400, 'Error Encountered');
		}
		var standardId = standard._id;
		populateComponents([root], null, standardId);
	});
};

var parseFiles = function(res, fields, files) {
	if(!files)
		return error.sendGenericError(res, 400, 'Error Encountered');
	// var jsonBuffer = fs.readFileSync(files.jsonFile.path, 'utf8');
	var datBuffer = fs.readFileSync(files.datFile.path, 'utf8');
	// var mapping = JSON.parse(jsonBuffer);
	var parse_result = Inst.parse(datBuffer);
	var generate_result = Inst.generateSubMenuHierachy();
	if(parse_result !== 'Success' || generate_result!== 'Success')
		return error.sendGenericError(res, 400, 'Error Encountered');
	var root = Inst.rootNode;
	populateSchematic(res, root);
	return res.send(200);
};

exports.receiveFiles = function(req, res) {
	var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
		if(err)
			return error.sendGenericError(res, 400, 'Error Encountered');
		if(!files.jsonFile || !files.datFile)
			return error.sendGenericError(res, 400, 'Error Encountered');
		parseFiles(res, fields, files);
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
		.exec(function(err, components) {
			if(err)
				return error.sendGenericError(res, 400, 'Error Encountered');
			return res.jsonp({'children': components});
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