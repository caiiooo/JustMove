const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const log = require("simple-node-logger").createSimpleLogger(
  "wip/logs/route_user.log"
);
require("dotenv").config();
var gm = require('gm').subClass({imageMagick: true});
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

//ENCRIPT SENHA
const bcrypt = require("bcrypt");
//TOKEN
const jwt = require("jsonwebtoken");
var randtoken = require("rand-token");

const User = require("../models/user");

router.post("/singup", (req, res, next) => {
  // if(req.file){
   
  //   var nameSpited = req.file.path.split('.');
   
  //   var tinyName = nameSpited[0]+"-tiny."+nameSpited[1];
   
  //   gm(element.path)
  //   .resize('20')
  //   .noProfile()
  //   .write(tinyName, function(err){
  //     if(!err){
  //       log.info('no error');
       
  //     }else{
  //       log.info(err);
  //     }
  //   });
  //   log.info(tinyName);
  //   photo = {
  //     url: element.path,
  //     tinyUrl: tinyName
  //   }
  // } 

  const emailReq = req.body.email.toLowerCase();
  if(req.body.username.trim().length > 20){
    return res.status(409).json({
      message: "Nome de usuário pode ter no máximo 20 caracteres "
    });
  }

  User.find({ email: emailReq })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "E-mail já cadastrado"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: emailReq,
              password: hash,
              username: req.body.username,         
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "User created"
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});

router.post("/login", (req, res, next) => {
  const emailReq = req.body.email.toLowerCase();
  User.findOne({ email: emailReq })
    .exec()
    .then(user => {
      log.info(user);
      if (user) {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (err) {
            res.status(401).json({
              message: "Não foi possivel autenticar"
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                id: user._id,
                email: user.email,
                username: user.username
              },
              "GSJsqetMU6nw3",
              { expiresIn: "2h" }
            );
            var refreshToken = randtoken.uid(256);
            user.refreshToken = refreshToken;
            user
              .save()
              .then(result => {
                console.log(result);
                return res.status(200).json({
                  message: "Autenticado com sucesso",
                  user:{
                    id: user._id,
                    username: user.username,
                    photo: user.photo,
                    email: emailReq,
                    token: token,
                    refreshToken: refreshToken
                  }
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          } else {
            return res.status(401).json({
              message: "Não foi possível autenticar"
            });
          }
        });
      } else {
        return res.status(401).json({
          message: "Não foi possivel autenticar"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post("/token", function(req, res, next) {
  const emailReq = req.body.email.toLowerCase();
  User.findOne({ email: emailReq })
    .exec()
    .then(user => {
      if (user < 1) {
        return res.status(401).json({
          message: "Não foi possível autenticar"
        });
      } else {
        var refreshToken = req.body.refreshToken;
        console.log("userToken:", user.refreshToken);
        console.log("recivedToken:", refreshToken);
        if (user.refreshToken == refreshToken) {
          const token = jwt.sign(
            {
              id: user._id,
              email: user.email,
              username: user.username
            },
            'GSJsqetMU6nw3',
            { expiresIn: '2h' }
          );
          var refreshToken = randtoken.uid(256);
          user.refreshToken = refreshToken;
          user
            .save()
            .then(result => {
              console.log(result);
              return res.status(200).json({
                message: "Atenticado com sucesso",
                user:{
                  token: token,
                  refreshToken: refreshToken
                }
              });
            })
            .catch(err => {
              console.log(err);
              res.status(500).json({
                error: err
              });
            });
        } else {
          return res.status(401).json({
            message: "Não foi possivel autenticar"
          });
        }
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// router.delete("/:userId", (req, res, next) => {
//   User.remove({ id: req.param.userId })
//     .exec()
//     .then(result => {
//       res.status(200).json({
//         message: "Usuário deletado"
//       });
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(500).json({
//         error: err
//       });
//     });
// });

module.exports = router;
