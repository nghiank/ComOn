'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    version = require('mongoose-version');


/**
 * Schematics Schema
 */

var standardSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        default: null
    }
});

mongoose.model('SchematicStandard', standardSchema);

//---------------------------------------------//

var componentSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    id: {
        type: String,
        required: true,
        trim: true
    },
    standard: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'SchematicStandard'
    },
    parentNode: {
        type: Schema.Types.ObjectId
    },
    thumbnail: {
        type: String,
        default: null
    },
    acad360l: {
        type: String,
        default: null
    },
    dl: {
        type: String,
        default: null
    },
    isComposite: {
        type: Boolean,
        default: false
    }
});
componentSchema.index({id: 1, parentNode: 1}, {unique: true});
componentSchema.plugin(version, { collection: 'Schematic__versions' });

mongoose.model('SchematicComponent', componentSchema);

