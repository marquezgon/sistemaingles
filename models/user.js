
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseUniqueValidator = require('mongoose-unique-validator');

var schema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    lastname: {type: String, required: true},
    created: {type: Date, required: true},
    status: {type: Number, required: true},
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('User', schema);