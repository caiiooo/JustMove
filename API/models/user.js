const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    required: true,
    unique: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  },
  password: { type: String, required: true },

  name: { type: String },
  pais: { type: String },
  language: { type: String },
  photo: { 
    url: String
  },
  username: { type: String },

  lugareAdicionados: {type:Number, default:0},
  reviewsAdicionados: {type:Number, default:0},
 
  favorites: [{
    placeId: {type: mongoose.Schema.Types.ObjectId, ref: 'Place'},
    data: Date
  }],

  created: { type: Date, default: Date.now },

  refreshToken: { type: String }
});

module.exports = mongoose.model("User", userSchema);
