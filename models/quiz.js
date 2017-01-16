
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    questions: [{ text: {type: String}, idQuestion: { type: mongoose.Schema.Types.ObjectId, ref: 'Question'}, idSection: { type: mongoose.Schema.Types.ObjectId, ref: 'Section'}}],
    book: {type: Schema.Types.ObjectId, ref: 'Book'},
    student : { type: mongoose.Schema.Types.ObjectId, ref: 'Student'},
    description : {type: String},
    title : {type: String, required: true},
    created: {type: Date, required: true},
    status: {type: Number, required: true}
});

module.exports = mongoose.model('Quiz', schema);