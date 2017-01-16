
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseUniqueValidator = require('mongoose-unique-validator');

var schema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    scope: {type: String, required: true},
    // escuela: {type: Schema.Types.ObjectId, ref: 'School'},
    lastname: {type: String, required: true},
    created: {type: Date, required: true},
    status: {type: Number, required: true},
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Student ', schema);