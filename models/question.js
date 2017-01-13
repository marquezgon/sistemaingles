
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    question: {type: String, required: true},
    answer: {type: String, required: true},
    section: {type: Schema.Types.ObjectId, ref: 'Section'},
    book: {type: Schema.Types.ObjectId, ref: 'Book'},
    created: {type: Date, required: true},
    status: {type: Number, required: true},
});

module.exports = mongoose.model('Question', schema);