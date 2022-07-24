const mongoose = require("mongoose");
//"name photo location modality rating"
const placeSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  created: { type: Date, default: Date.now },
  photo: [
    {
      url: String,
      tinyUrl: String,
      minithumbName:String,
      thumbUrl: String
    }
  ],
  location: {
    type: { type: String },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  modality: [
    {
      _id: String,
      name: { type: String, required: true },
      type: { type: String, required: true },
      icon: { type: String, required: true }
    }
  ],
  creator: {
    _id: String,
    email: { type: String, required: true },
    username: { type: String, required: true },
    photo: { type: String },
  },
  rating: { type: Number },
  reviews:[{
    _id: mongoose.Schema.Types.ObjectId,
    creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, 
    // creator: {
    //   _id: { type: String, required: true },
    //   email: { type: String },
    //   username: { type: String, required: true },
    //   photo: { type: String },
    // },
    rating: { type: Number },
    comment: String,
    date_update: Date,
    date_created: { type: Date, default: Date.now },
    photo: [
      {
        url: String,
        tinyUrl: String,
        minithumbName:String,
        thumbUrl: String
      }
    ],  
    likes: [
      {
        like_id: String,
        creator_id:  {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        }
      }
    ]
  }]
});

module.exports = mongoose.model("Place", placeSchema);
