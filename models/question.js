
var mongoose = requiere('mongoose');
var schema = mongoose.Schema;
var mongooseUniqueValidator = require('mongoose-unique-validator');

var schema = new Schema({
    question: {type: String, required: true},
    answer: {type: Date, required: true},
    seccion: {type: Schema.Types.ObjectId, ref: 'Section'},
    created: {type: Date, required: true},
    status: {type: Number, required: true},
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Question', schema);