const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const log = require("simple-node-logger").createSimpleLogger(
  "wip/logs/route_profile.log"
);
const checkAuth = require("../middleware/check-auth");
require("dotenv").config();

var gm = require('gm').subClass({imageMagick: true});
var multer = require("multer");
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "wip/uploads/profile/");
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



const User = require("../models/user");
const Place = require("../models/place");

router.get("/:user_id", (req, res, next) => {
  User.findOne({ _id: req.params.user_id })
    .select(
      "_id username language photo pais lugareAdicionados reviewsAdicionados favorites"
    )
    .populate({
      path: "favorites.placeId"
    })
    .populate({
      path: "favorites.placeId.reviews.creator",
      select: "username photo"
    })
    .exec()
    .then(docs => {
      const reponse = {
        user: docs
      };
      //   if (docs >= 0) {
      res.status(200).json(reponse);
    })
    .catch(err => {
      log.info(req);
      log.info(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get("/adicionados/:user_id", (req, res, next) => {

  Place.find({
    "creator._id": req.params.user_id 
  })
  .populate({
    path: "reviews.creator",
    select: "username photo"
  })
  .then(docs => {
      const response = {
        count: docs.length,
        places: docs,
        time: new Date().getTime()
      };
      //   if (docs >= 0) {
      res.status(200).json(response);
    })
    .catch(err => {
      log.info(req);
      log.info(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get("/review/:user_id", (req, res, next) => {

  Place.find({
    "reviews.creator": req.params.user_id 
  })
  .populate({
    path: "reviews.creator",
    select: "username photo"
  })
  .then(docs => {
      const response = {
        count: docs.length,
        places: docs,
        time: new Date().getTime()
      };
      //   if (docs >= 0) {
      res.status(200).json(response);
    })
    .catch(err => {
      log.info(req);
      log.info(err);
      res.status(500).json({
        error: err
      });
    });
});

//ADD FAVORITE
router.post("/favorito/:place_id", checkAuth, (req, res, next) => {
  favorite = {
    placeId: req.params.place_id,
    data: new Date()
  };

  User.findOne({
    _id: req.userData.id,
    "favorites.placeId": req.params.place_id
  })
    .select("favorites")
    .then(result => {
      if (result) {
        User.update(
          { _id: req.userData.id },
          { $pull: { favorites: { placeId: req.params.place_id } } }
        )
          .then(result => {
            if (result.nModified > 0) {
              res.status(200).json({
                message: "Favorito removido!"
              });
            } else {
              res.status(500).json({
                error: "Erro ao remover o favorito"
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
      } else {
        User.update(
          { _id: req.userData.id },
          { $push: { favorites: favorite } }
        )
          .then(result => {
            if (result.nModified > 0) {
              res.status(200).json({
                message: "Favorito adicionado!",
                favorite: favorite
              });
            } else {
              res.status(500).json({
                error: "Erro ao adicionar o favorito"
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
      }
    })
    .catch(err => {
      log.info(req);
      log.info(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post("/image", checkAuth, upload.single('profileImg'), (req, res, next) => {
  console.log('entro aqui');
  if(req.file){
    console.log('entro aqui');
    var nameSpited =  req.file.path.split(".");
    var normalName = nameSpited[0]+"-400x400."+nameSpited[1];
    var thumbName = nameSpited[0]+"-thumb."+nameSpited[1];
    var tinyName = nameSpited[0] + "-tiny." + nameSpited[1];
    gm(req.file.path)
    .resize('400', null)
    .gravity('Center')
    .crop('400', '400')
    .noProfile()
    .write(normalName, function(err){
      if(!err){
        //log.info('no error');
        //res.redirect('/');
      }else{
        log.info(err);
      }
    });
    gm(req.file.path)
    .resize('100', null)
    .gravity('Center')
    .crop('100', '100')
    .noProfile()
    .write(thumbName, function(err){
      if(!err){
        //log.info('no error');
        //res.redirect('/');
      }else{
        log.info(err);
      }
    });
    gm(req.file.path)
    .gravity('Center')
    .resize('20', null)
    .crop('20', '20')
    .noProfile()
    .write(tinyName, function(err) {
      if (!err) {
        log.info("no error");
        //res.redirect('/');
      } else {
        log.info(err);
      }
    });
    //log.info(tinyName);
    var photoObj = {
      url: normalName,
      thumbUrl: thumbName,
      tinyUrl: tinyName
    };
    console.log(photoObj.url);
  }
  User.update(
    { _id: req.userData.id },
    { photo: photoObj }
  )
    .then(result => {
      if (result.nModified > 0) {
        res.status(201).json({
          message: "Foto adicionada com sucesso.",
          photo: photoObj
        });
      } else {
        res.status(500).json({
          error: "Erro ao adicionar foto"
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
    
  
});

module.exports = router;
