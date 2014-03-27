'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

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
    type:{
        code: {
            type: String,
            required: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        }
    },
    additionalInfo: {
        type: Schema.Types.Mixed,
        default: null
    }

});
catalogSchema.index({catalog: 1, manufacturer: -1, assemblyCode: 1, 'type.code': 1}, {unique: true});

mongoose.model('Catalog', catalogSchema);

