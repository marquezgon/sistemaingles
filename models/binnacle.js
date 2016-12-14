var mongoose = requiere('mongoose');
var schema = mongoose.Schema;
var mongooseUniqueValidator = require('mongoose-unique-validator');

var schema = new Schema({
    action: {type: String, required: true},
    escuela: {type: Schema.Types.ObjectId, ref: 'User'},
    created: {type: Date, required: true},
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Teacher', schema);