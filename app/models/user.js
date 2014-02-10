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
    }
});

mongoose.model('User', UserSchema);