// const bcrypt = require("bcrypt");

// var pashashed = ";"
// // bcrypt.hash('ladaca76', 10, function(err, hash) {
// //   pashashed = hash;
// //   console.log(hash);
// // });
// bcrypt.compare('ladaca76', "$2b$10$GKN13ZKuFKlCZINr0UDO1Ohbnkaj5K.uAganWcHEJe54oxyw8odxO", (err, result)=>{
//   console.log(result);
// })

// function distance(lat1, lon1, lat2, lon2, unit) {
// 	var radlat1 = Math.PI * lat1/180
// 	var radlat2 = Math.PI * lat2/180
// 	var theta = lon1-lon2
// 	var radtheta = Math.PI * theta/180
// 	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
// 	if (dist > 1) {
// 		dist = 1;
// 	}
// 	dist = Math.acos(dist)
// 	dist = dist * 180/Math.PI
// 	dist = dist * 60 * 1.1515
// 	if (unit=="K") { dist = dist * 1.609344 }
// 	if (unit=="N") { dist = dist * 0.8684 }
// 	return dist
// }
// console.log(distance(-29.16499717, -51.1976724, -29.22014487, -51.33912137, "K"))

const mongoose = require("mongoose");
const Place = require("./api/models/place");
 const Modality = require("./api/models/modality");
 const User = require("./api/models/user");
const ModalityPack = require("./api/models/modalityPack");
require("dotenv").config();

mongoose.connect(
  "mongodb://" +
    process.env.DB_USER +
    ":" +
    process.env.DB_PASS +
    "@" +
    process.env.DB_HOST +
    ":27017/" +
    process.env.DB_USER,
  { useNewUrlParser: true }
);
mongoose.Promise = global.Promise;


// ModalityPack.find({})
// .populate({
//   path: "modalitys.modality",
//   select: "name"
// })
// .exec()


// Modality.find()
// .select("_id name type")
// .sort('name')
// .then(result=>{
//   console.log(result);
//   // result.modalitys.forEach(element => {
//   //   console.log(element)
//   // });
// }).catch(err =>{
//   console.log(err);
// });


//User.updateMany({}, {reviewsAdicionados:'0', lugareAdicionados:'0'})
// Modality.updateMany({}, {quantPlaces:'0'})
//   .exec()
//   .then(result =>{
// 	  if(result){
// 		  console.log(result);
// 	  }else{
// 		  console.log("sem result");
// 	  }
//   }).catch(err => {
//       console.log(err);
//     });


// Place.find({
//   "reviews.creator._id": "5c052b902b198679aadcfa91"
// })
// .then(result=>{
//   if(result)
//   console.log(result);
//   else
//   console.log('qqw')
// }).catch(err => {
//   console.log(err);
// })


// Place.aggregate([
//   {
//     $geoNear: {
//        near: { type: "Point", coordinates: [ -73.99279 , 40.719296 ] },
//        distanceField: "dist.calculated",
//        minDistance: 2,
//        includeLocs: "dist.location",
//        num: 5,
//        spherical: true
//     }
//   }
// ])




Place.find({
 
  location:{
    $near: {
      $maxDistance: 10000000,
      $geometry: {
        type: 'Point',
        coordinates: [-51.5096576, -29.179904]
      }
    } 
  }
})
.limit(15)
.skip(5)
.then(result=>{
  if(result)
  result.forEach(place =>{
    console.log(place.name);
    console.log(calculateDistance(place.location.coordinates, [-51.5096576, -29.179904]));
  });
  // console.log(result)
  //console.log(calculateDistance([result.location.coordinates.longitude,result.location.coordinates.lati],[-51.5096576, -29.179904]));
  // elsce
  console.log('qqw')
}).catch(err => {
  console.log(err);
})
let calculateDistance = (cord1, cord2) => {
  var radlat1 = (Math.PI * cord1[1]) / 180;
  var radlat2 = (Math.PI * cord2[1]) / 180;
  var theta = cord1[0] - cord2[0];
  var radtheta = (Math.PI * theta) / 180;
  var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
      dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
 
  dist = dist * 1.609344;//k
  //dist = dist * 0.8684;
  return dist.toFixed(2);
};

// User.findOne({email:"caioo@hiboost.com.br"})
//   .exec()
//   .then(result =>{
// 	  if(result){
// 		console.log(result);
// 	  }else{
// 		console.log("sem result");
// 	  }

//   });
// var arrayModalitys = []
// console.log(mongoose.Types.ObjectId('5bb77ab4bdf3a54828c2a22d'));
// arrayModalitys.push(mongoose.Types.ObjectId('5bb77ab4bdf3a54828c2a22d'));
// console.log(arrayModalitys);ObjectId("5bce07560304250b69794a63")ObjectId("5bce043b0304250b69794a61")
//Modality.update({_id:{$in: ["5bce07560304250b69794a63", "5bce043b0304250b69794a61"]}} )
// Place.find({
//   "modality.modality_id": {
//     $in: ["5bb77ab4bdf3a54828c2a22d"]
//   },

//   location: {
//     $near: {
//       $maxDistance: "10000",
//       $geometry: {
//         type: "point",
//         coordinates: ["-29.2409691", "-51.33408034"]
//       }
//     }
//   }
// }
// )
// Place.find({
//     "modality._id": {$in: ['5bce043b0304250b69794a61']},
//     location: {
//       $near: {
//         $maxDistance: 1000000,
//         $geometry: {
//           type: 'Point',
//           coordinates: [-46.5224647521973, -23.4712375739496]
//         }
//       }
//     }

//     $or: [ { rating: null }, { rating: {$gt : 0} } ]
//      rating: {$gt : 0}
//   })
var place_id ="5bdb259e1fbfb9bb352d47de";

var user_id = "5bcf0f4d39b9c1ede6cdc538";
// var conditions = { _id: user_id },
// update = { $inc: { lugareAdicionados: 1 } };
// User.update(conditions, update);
// User.findById(user_id, "_id email username photo")
//   .then(creator => {
//     var review = {
//       creator: creator,
//       rating:"0",
//       comment:"Ihii irando",
//       date_update: new Date
//       //photos
//     };
//     Place.findById(place_id).then(place => {
//       place.reviews.push(review);
//       place.save().then(result =>{
//         //console.log(result);
//         creator.update({ $inc: { reviewsAdicionados: 1 }});
//       });
//     }).catch();
//   })
//   .catch();

// Place.findById(place_id)
//   .then(place => {
//     console.log(place.rating);
//     if (typeof place.rating == "undefined" || place.rating == null) {
//       place.rating = "4";
//     } else {
//       var totalRating = "3";
//       place.reviews.forEach(ratingReview => {
//         totalRating += ratingReview.rating;
//         console.log(
//           "review rating: " + ratingReview.rating
//         );
//       });
//       console.log("Total rating: " + totalRating);

//       console.log("Divisao " + totalRating / (place.reviews.length + 1));
//       var result = totalRating / (place.reviews.length + 1);
//       console.log(typeof result);
//       //place.rating = totalRating/(place.reviews.length+1);
//     }
//     // place.save().then(result => {
//     //   console.log(result);
//     // });
//   })
//   .catch(err => {
//     console.log(err);
//   });

//UPDATE MANY
// create query conditions and update variables
// var conditions = {_id:{$in: ["5bce07560304250b69794a63", "5bce043b0304250b69794a61"]}},
//     update = { $inc: { quantPlaces: 1 }};

// update documents matching condition
// Modality.updateMany(conditions, update)
//   .exec()
// Place.update( {
//     'reviews._id':  "5c0804da4ace32f5742fc6cd"
// }, {
//     $pull : {
//         "reviews.$.likes": {
//           _id: new mongoose.Types.ObjectId()
//         }
//       }
// })ObjectId("5bcf0f4d39b9c1ede6cdc538")
// Place.update(
//     {
//     //   "reviews._id": '5c07ed5d4ace32f5742fc6cc',  
//       "reviews.likes._id": '5c0fac973cfa5d1c6cb56c11',
//       "reviews.likes.creator_id": "5bcf0f4d39b9c1ede6cdc538"
//     },
//     {
//       $pull: {
//         "reviews.$.likes": {
//           _id: '5c0fac973cfa5d1c6cb56c11'
//         }
//       }
//     }
//   )
// // Place.find( { 'reviews._id':  "5c0804da4ace32f5742fc6cd" } )
// .then(lugar =>{
//     console.log(lugar);
// }).catch(err =>{
//     console.log(err);
// })


//console.log(new Date().getTime());

// var server = require('http').createServer();
// var io = require('socket.io')(server);

// io.on('connection', function(socket){
//   console.log('a user connected');
//   socket.on('disconnect', function(){
//     console.log('user disconnected');
//   });
// });
// io.on('connection', function(socket){
//   console.log('socket connected');
//   socket.on('chat message', function(msg){
//     console.log('message: ' + msg);
//   });
// });

// io.sockets.on('connection', function (socket) {
//     console.log('socket connected');

//     socket.on('disconnect', function () {
//         console.log('socket disconnected');
//     });

//     socket.emit('text', 'wow. such event. very real time.');
// });

// server.listen(3000);


// var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);

// var clients = {};

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//       "Access-Control-Allow-Headers",
//       "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   if(req.method === 'OPTIONS'){
//       res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, GET, DELETE');
//       return res.status(200).json({});
//   }
//   next();
// });


// app.get('/', function(req, res){
//   res.send('server is running');
// });

// io.on("connection", function (client) {
//   //console.log('connection');
//   client.on("join", function(name){
//     console.log("Joined: " + name);
//     clients[client.id] = name;
//     client.emit("update", "You have connected to the server.");
//     client.broadcast.emit("update", name + " has joined the server.")
//   });

//   client.on("send", function(msg){
//     console.log("Message: " + msg);
//     client.broadcast.emit("chat", clients[client.id], msg);
//   });

//   client.on("disconnect", function(){
//     console.log("Disconnect");
//     io.emit("update", clients[client.id] + " has left the server.");
//     delete clients[client.id];
//   });
// });

// http.listen(3000, function(){
//   console.log('listening on port 3000');
// });

// var dateDiference = (date) =>{
//   console.log();
// };

// dateDiference();
// Date.daysBetween = function( date1, date2 ) {
//   //Get 1 day in milliseconds
//   var one_day=1000*60*60*24;

//   // Convert both dates to milliseconds
//   var date1_ms = date1.getTime();
//   var date2_ms = date2.getTime();

//   // Calculate the difference in milliseconds
//   var difference_ms = date2_ms - date1_ms;
//   //take out milliseconds
//   difference_ms = difference_ms/1000;
//   var seconds = Math.floor(difference_ms % 60);
//   difference_ms = difference_ms/60; 
//   var minutes = Math.floor(difference_ms % 60);
//   difference_ms = difference_ms/60; 
//   var hours = Math.floor(difference_ms % 24);  
//   var days = Math.floor(difference_ms/24);


//   //return days + ' days, ' + hours + ' hours, ' + minutes + ' minutes, and ' + seconds + ' seconds';
//   if(days >= 730)
//     return "Há " + Math.floor(days/365) + " anos";
  
//   if(days >= 365)
//     return "Há " + Math.floor(days/365) + " ano";
    
//   if(days >= 60)
//     return "Há " + Math.floor(days/30) + " meses";

//   if(days >= 30)
//     return "Há " + Math.floor(days/30) + " mês";

//   if(days > 1)
//     return  "Há " + days + " dias";
    
//   if(days == 1)
//     return  "Há " + days + " dia";

//   if(hours > 1)
//     return "Há " + hours + " horas";
  
//   if(hours == 1)
//     return "Há " + hours + " hora";

//   if(minutes > 1)
//     return "Há " + minutes + " minutos";
  
//   if(minutes == 1)
//     return "Há " + minutes + " minuto";
  
  
//   return "Agora mesmo";

  

  
// }

// var otherDay = new Date('2003-3-25 10:06:23.895');
// var today = new Date();
// console.log(otherDay +" - "+ today);
// //displays "Days from Wed Jan 01 0110 00:00:00 GMT-0500 (Eastern Standard Time) to Tue Dec 27 2011 12:14:02 GMT-0500 (Eastern Standard Time): 694686 days, 12 hours, 14 minutes, and 2 seconds"
// console.log(Date.daysBetween(otherDay, today));

// console.log(Math.floor('30'/365));