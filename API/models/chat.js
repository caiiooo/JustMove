const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  place:{
      _id:{},
      description:{}
    },
  coordinates: {
    latitude: { type: String },
    longitude: { type: String }
  },
  modality:{
      _id:{},
      name: String
  },
  messages:[
      {
        _id:mongoose.Schema.Types.ObjectId,
        creator:String,
        text:String,
        data:{}
      }
  ]
});

module.exports = mongoose.model("Modality", placeSchema);
