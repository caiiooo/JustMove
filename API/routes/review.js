const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Place = require("../models/place");
const User = require("../models/user");
const checkAuth = require("../middleware/check-auth");
const log = require("simple-node-logger").createSimpleLogger(
  "wip/logs/review.log"
);
var gm = require("gm").subClass({ imageMagick: true });
var multer = require("multer");
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "wip/uploads/review/");
  },
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + "." + file.originalname.split(".")[1]
    );
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.post("/", checkAuth, upload.array("reviewImg", 5), (req, res, next) => {
  log.info(req.files);
  log.info("User Data: " + req.userData.id);
  var photoArray = [];

  // console.log(req.file);
  // console.log("Descripition " + req.body.description);

  //Cria array de fotos com autores
  req.files.forEach(element => {
    var nameSpited = element.path.split(".");
    var thumbName = nameSpited[0]+"-thumb."+nameSpited[1];
    var minithumbName = nameSpited[0]+"-minithumb."+nameSpited[1];
    var tinyName = nameSpited[0] + "-tiny." + nameSpited[1];
    gm(element.path)
    .resize('600')
    .noProfile()
    .write(thumbName, function(err){
      if(!err){
        log.info('no error');
        res.redirect('/');
      }else{
        log.info(err);
      }
    });
    gm(element.path)
    .resize(null, '50')
    .noProfile()
    .write(minithumbName, function(err){
      if(!err){
        log.info('no error');
        res.redirect('/');
      }else{
        log.info(err);
      }
    });
    gm(element.path)
      .resize("20")
      .noProfile()
      .write(tinyName, function(err) {
        if (!err) {
          log.info("no error");
          //res.redirect('/');
        } else {
          log.info(err);
        }
      });
    log.info(tinyName);
    photoArray.push({
      url: element.path,
      thumbUrl: thumbName,
      minithumbName:minithumbName,
      tinyUrl: tinyName
    });
  });

  User.findById(req.userData.id, "_id")
    .then(creator => {
      //log.info(review);
      Place.findById(req.body.placeId)
        .then(place => {
          var currentReview = null;
          var ratingAntigo = 0;
          place.reviews.find(reviewplace => {
            log.info("reviewplace.creator == req.userData.id "+ reviewplace.creator +" - "+ req.userData.id);
            if (reviewplace.creator == req.userData.id) {
              currentReview = reviewplace;
              //log.info('user ja crio review nesse lugar');
              reviewplace.creator = creator._id;
              ratingAntigo = reviewplace.rating;
              reviewplace.rating = req.body.rating;
              reviewplace.comment = req.body.comment;
              reviewplace.date_update = new Date();
              photoArray.forEach(photo => {
                reviewplace.photo.push(photo);
              });
              return true;
            }
          });
          if (currentReview) {
            //log.info('entro aqui');
            if (typeof place.rating == "undefined" || place.rating == null) {
              place.rating = req.body.rating;
            } else {
              //log.info('entro aqui tb');
              //log.info(ratingAntigo +"-"+ req.body.rating);
              if (ratingAntigo != req.body.rating) {
                //log.info('entro aqui tb 2');
                //log.info('quant rating: '+ place.reviews.length);
                var calculaRating = place.rating * place.reviews.length;
                //log.info('calculaRating :'+calculaRating);
                //log.info("typeof: "+ typeof calculaRating);
                //log.info("typeof: "+ typeof ratingAntigo);
                //log.info("typeof: "+ typeof req.body.rating);
                calculaRating =
                  calculaRating - ratingAntigo + parseInt(req.body.rating);
                //log.info('soma calculaRating :'+calculaRating);
                place.rating = calculaRating / place.reviews.length;
              }
            }

            //log.info('saiu');
            //currentReview = review;
            place.save()            
            .then(result => {
              result.populate({
                path: "reviews.creator",
                select: "username photo"
              }).execPopulate()
              .then(resultPop=>{
                res.status(201).json({
                  message: "Review updated!",
                  createdReview: resultPop
                });
              });
            });
          } else {
            var review = {
              _id: new mongoose.Types.ObjectId(),
              creator: creator._id,
              rating: req.body.rating,
              comment: req.body.comment,
              date_update: new Date(),
              photo: photoArray
            };
            if (typeof place.rating == "undefined" || place.rating == null) {
              place.rating = req.body.rating;
            } else {
              var totalRating = parseInt(req.body.rating);
              place.reviews.forEach(ratingReview => {
                totalRating += ratingReview.rating;
                //log.info("review rating: "+ ratingReview.rating);
              });
              //log.info("Soma rating: "+ totalRating);
              place.rating = totalRating / (place.reviews.length + 1);
              //log.info("place.rating: "+ place.rating);
            }
            place.reviews.push(review);
            place.save()            
            .then(result => {
              result.populate({
                path: "reviews.creator",
                select: "username photo"
              })
              .execPopulate()
              .then(resultPop =>{
                res.status(201).json({
                  message: "Review created!",
                  createdReview: resultPop
                });
                creator.update({ $inc: { reviewsAdicionados: 1 } }).exec();
              });
            });
          }
        })
        .catch(err => {
          log.info(req);
          log.info(err);
          res.status(500).json({
            error: err
          });
        });
    })
    .catch(err => {
      log.info(req);
      log.info(err);
      res.status(500).json({
        error: err
      });
    });
});

router.delete("/photo/:photo_id", checkAuth, (req, res, next) => {
  Place.update(
    {
      "reviews.photo._id": req.params.photo_id,
      "reviews.creator._id": req.userData.id
    },
    {
      $pull: {
        "reviews.$.photo": {
          _id: req.params.photo_id
        }
      }
    }
  )
    .then(lugar => {
      if (lugar.nModified > 0) {
        res.status(200).json({
          message: "Review photo deleted!",
          id: req.params.photo_id
        });
      } else {
        res.status(500).json({
          error: "Erro ao selecionar a photo"
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.post("/addLike/:review_id", checkAuth, (req, res, next) => {
  var addLike = {
    _id: new mongoose.Types.ObjectId(),
    creator_id: req.userData.id
  };
  
  Place.update(
    {
      "reviews._id": req.params.review_id
    },
    {
      $push: {
        "reviews.$.likes": addLike
      }
    }
  )
    .then(result => {
      if (result.nModified > 0) {
        res.status(200).json({
          message: "Like adicionado!",
          like: addLike
        });
      } else {
        res.status(500).json({
          error: "Erro ao adicionar o like"
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.post("/removeLike/:like_id", checkAuth, (req, res, next) => {
  Place.update(
    {
      "reviews.likes._id":  req.params.like_id,
      "reviews.likes.creator_id": req.userData.id
    },
    {
      $pull: {
        "reviews.$.likes": {
          _id:  req.params.like_id
        }
      }
    }
  )
    .then(result => {
      if (result.nModified > 0) {
        res.status(200).json({
          message: "Like removido!",
          id: req.params.like_id
        });
      } else {
        res.status(500).json({
          error: "Erro ao remover o like"
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
