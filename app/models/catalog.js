'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//---------------------------------------------//

var catalogSchema = new Schema({
    id: {
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
        type: Schema.Types.ObjectId
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: null
    }
});
catalogSchema.index({id: 1, manufacturer: -1, assemblyCode: 1, type: 1}, {unique: true});

mongoose.model('Catalog', catalogSchema);

