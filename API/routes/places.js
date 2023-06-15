const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const checkAuth = require("../middleware/check-auth");
const Place = require("../models/place");
const Modality = require("../models/modality");
const User = require("../models/user");
// const
const { upload, uploadFiles } = require("../utils/storage");

router.get("/", (req, res, next) => {
  Place.find()
    .exec()
    .then((docs) => {
      const reponse = {
        count: docs.length,
        places: docs,
      };
      //   if (docs >= 0) {
      res.status(200).json(reponse);
    })
    .catch((err) => {
      console.log(req);
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:rating/:dist/:type/:long/:latt/:perPage/:page", (req, res, next) => {
  var searchParameter = {};
  var modalitys = [];

  if (req.query.modality) {
    if (Array.isArray(req.query.modality)) {
      modalitys = req.query.modality;
    } else {
      modalitys.push(req.query.modality);
    }
    searchParameter = {
      "modality._id": { $in: modalitys },
    };
  }

  let distance = 0;
  if (typeof req.params.dist == "undefined" || req.params.dist == null || req.params.dist == "*") distance = 99999000;
  else distance = req.params.dist;

  searchParameter.location = {
    $near: {
      $maxDistance: distance,
      $geometry: {
        type: req.params.type,
        coordinates: [req.params.long, req.params.latt],
      },
    },
  };

  // let distance = 0;
  // if(typeof req.params.dist == "undefined" || req.params.dist == null)
  //   distance = 99999;
  // else
  // distance = req.params.dist;

  //console.log('req.param.rating ', parseInt(req.params.rating) >= 1);
  if (parseInt(req.params.rating) >= 1) {
    searchParameter.$or = [{ rating: { $exists: false } }, { rating: { $gte: req.params.rating } }];
  }

  //console.log("Array modalitys", modalitys);
  //console.log("searchParameter2",searchParameter);
  // {
  //   "modality._id": { $in: modalitys },
  //   location: {
  //     $near: {
  //       $maxDistance: req.params.dist,
  //       $geometry: {
  //         type: req.params.type,
  //         coordinates: [req.params.long, req.params.latt]
  //       }
  //     }
  //   }
  //    rating: {$gt : 0}
  // }

  var perPage = 5;
  var page = 0;
  if (req.params.perPage) {
    perPage = parseInt(req.params.perPage);
  }
  if (req.params.page) {
    page = req.params.page;
  }
  //console.log('perPage '+ req.params.perPage + " type: " + typeof req.params.perPage);
  Place.find(searchParameter)
    .select("_id name rating modality location photo reviews.length")
    .limit(perPage)
    .skip(perPage * page)
    // .aggregate([
    //   {
    //     $geoNear: {
    //        near: { type: "Point", coordinates: [ -73.99279 , 40.719296 ] },
    //        distanceField: "dist.calculated",
    //        maxDistance: distance,
    //        includeLocs: "dist.location",
    //        num: 5,
    //        spherical: true
    //     }
    //   }
    // ])
    // .sort('mykey', 1)
    // .sort({
    //     name: 'asc'
    // })
    // .populate({
    //   path: "reviews.creator",
    //   select: "username photo"
    // })
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        places: docs,
        time: new Date().getTime(),
      };
      //   if (docs >= 0) {
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(req);
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:place_id", (req, res, next) => {
  Place.findOne({
    _id: req.params.place_id,
  })
    .populate({
      path: "reviews.creator",
      select: "username photo",
    })
    .exec()
    .then((docs) => {
      //   if (docs >= 0) {
      res.status(200).json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

//checkAuth
router.post("/", checkAuth, upload.array("placeImages", 5), async (req, res, next) => {
  console.log(req.files)
  if (!req.body.modality || !req.body.name || !req.body.locationcoordinateslong || !req.body.locationcoordinateslatt || !req.files)
    return  res.status(406).json({
      error: "Erro ao validar os campos",
    });

  console.log(req.files);
  let files = req.files;
  if (!Array.isArray(files)) files = [files];
  const imgUrls = [];
  for await (file of files) {
    const url = await uploadFiles(file, "places");
    imgUrls.push({ url: url });
  }

  //busca as icones das modalidades selecionadas
  var modalitys = [];
  if (Array.isArray(req.body.modality)) {
    modalitys = req.body.modality;
  } else {
    modalitys.push(req.body.modality);
  }
  console.log("modalitys", modalitys);

  Modality.find({
    _id: { $in: modalitys },
  })
    .select("_id name icon type")
    .then((modailtyResult) => {
      console.log(modailtyResult);
      const place = new Place({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        photo: imgUrls,
        creator: {
          _id: req.userData.id,
          email: req.userData.email,
          username: req.userData.username,
        },
        location: {
          type: req.body.locationtype,
          coordinates: [req.body.locationcoordinateslong, req.body.locationcoordinateslatt],
        },
        modality: modailtyResult,
      });

      place
        .save()
        .then((result) => {
          res.status(201).json({
            message: "Created place successfuly",
            createdPlace: result,
          });

          //UPDATE MODALITYS quantPlace
          var conditions = { _id: { $in: modalitys } },
            update = { $inc: { quantPlaces: 1 } };
          Modality.updateMany(conditions, update).exec();
          var conditions = { _id: req.userData.id },
            update = { $inc: { lugareAdicionados: 1 } };
          User.updateOne(conditions, update).exec();
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            error: err,
          });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});
// router.get("/:orderId", (req, res, next) => {
//   res.status(200).json({
//     message: "Places details!",
//     id: req.params.orderId
//   });
// });

router.delete("/:orderId", (req, res, next) => {
  res.status(200).json({
    message: "Place deleted!",
    id: req.params.orderId,
  });
});

function distance(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = (Math.PI * lat1) / 180;
  var radlat2 = (Math.PI * lat2) / 180;
  var theta = lon1 - lon2;
  var radtheta = (Math.PI * theta) / 180;
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit == "K") {
    dist = dist * 1.609344;
  }
  if (unit == "N") {
    dist = dist * 0.8684;
  }
  return dist;
}

module.exports = router;
