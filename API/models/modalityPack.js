const mongoose = require("mongoose");

const modalitySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  created: { type: Date, default: Date.now },
  modalitys: [{
    modality: {type: mongoose.Schema.Types.ObjectId, ref: 'Modality'}
  }],
});

module.exports = mongoose.model("ModalityPack", modalitySchema);
