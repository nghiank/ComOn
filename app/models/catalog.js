'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    textSearch = require('mongoose-text-search');

//---------------------------------------------//

var catalogSchema = new Schema({
    catalog: {
        type: String,
        required: true,
        trim: true
    },
    manufacturer: {
        type: String,
        required: true,
        trim: true
    },
    assemblyCode: {
        type: String,
        default: null
    },
    typeCode: {
        type: String,
        required: true,
        trim: true
    },
    typeName: {
        type: String,
        required: true,
        trim: true
    },
    additionalInfo: {
        type: Schema.Types.Mixed,
        default: null
    }

});
catalogSchema.plugin(textSearch);
catalogSchema.index({ catalog: 'text' ,additionalInfo: 'text', manufacturer: 'text', typeName: 'text'});
catalogSchema.index({catalog: 1, manufacturer: -1, assemblyCode: 1, typeCode: 1}, {unique: true});

mongoose.model('Catalog', catalogSchema);

