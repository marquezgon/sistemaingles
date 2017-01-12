
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name: {type: String, required: true},
    created: {type: Date, required: true},
    status: {type: Number, required: true},
});

module.exports = mongoose.model('Book', schema);