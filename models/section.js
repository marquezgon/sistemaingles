
var mongoose = requiere('mongoose');
var schema = mongoose.Schema;
var mongooseUniqueValidator = require('mongoose-unique-validator');

var schema = new Schema({
    name: {type: String, required: true},
    book: {type: Schema.Types.ObjectId, ref: 'Book'},
    created: {type: Date, required: true},
    status: {type: Number, required: true},
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Section', schema);