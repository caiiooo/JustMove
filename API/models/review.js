const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  place_id: String,
  place_name: String,
  creator: {
    creator_id: { type: String, required: true },
    email: { type: String },
    username: { type: String, required: true },
    photo: { type: String },
  },

  rating: { type: mongoose.Schema.Types.Decimal128 },
  comment: String,
  date_update: Date,
  date_created: { type: Date, default: Date.now },
  likes: [
    {
      like_id: String,
      creator_id: String
    }
  ]
});

module.exports = mongoose.model("review", reviewSchema);
