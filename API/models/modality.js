const mongoose = require('mongoose');

const modalitySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    type:{type: String, required: true},
    icon: String,
    quantPlaces: {type:Number, default:0},
    created: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Modality', modalitySchema);