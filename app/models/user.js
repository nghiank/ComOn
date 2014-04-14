'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * User Schema
 */
var UserSchema = new Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    Id: {
        type: String,
        default: null
    },
    provider: String,
    lastLogin: Date,
    lastLogout: Date,
    isAdmin: {
        type: Boolean,
        default: false
    },
    isManufacturer: {
        type: Boolean,
        default: false
    },
    codeName:{
        type: String,
        default: null
    },
    SchemFav: [{ type: Schema.ObjectId, ref: 'SchematicComponent' }],
    catalogFilters: [{
        type: Schema.Types.Mixed,
        default: null
    }]
});

UserSchema.index({isAdmin: 1});
UserSchema.index({isManufacturer: 1});
UserSchema.index({name: 1});
mongoose.model('User', UserSchema);