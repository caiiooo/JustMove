const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { upload, uploadFiles } = require("../utils/storage");
const { reduceImageSize } = require("../utils/image");
require("dotenv").config();

//ENCRIPT SENHA
const bcrypt = require("bcryptjs");
//TOKEN
const jwt = require("jsonwebtoken");
var randtoken = require("rand-token");

const User = require("../models/user");

router.post("/singup", upload.single("photo"), (req, res, next) => {
  console.log(req.file);
  if (!req.body.username || !req.body.email || !req.body.password || !req.file || typeof req.file === "undefined")
    return res.status(406).json({
      error: "Erro ao validar os campos",
    });

  // Create a new blob in the bucket and upload the file data.
  // console.log(url)

  const emailReq = req.body.email.toLowerCase();
  if (req.body.username.trim().length > 20)
    return res.status(406).json({
      error: "Nome de usuário pode ter no máximo 20 caracteres ",
    });
  if (!req.body.password || typeof req.body.password === "undefined")
    return res.status(406).json({
      error: "Você precisa informar uma senha.",
    });
  if (req.body.password.trim().length < 8)
    return res.status(406).json({
      error: "A senha deve ter mais de 8 caracteres.",
    });

  User.find({ email: emailReq })
    .exec()
    .then(async (user) => {
      if (user.length >= 1)
        return res.status(406).json({
          error: "E-mail já cadastrado",
        });
      const url = await uploadFiles(req.file, "users");
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        console.log(hash);
        if (err) {
          return res.status(500).json({
            error: err,
          });
        } else {
          const user = new User({
            _id: new mongoose.Types.ObjectId(),
            email: emailReq,
            password: hash,
            username: req.body.username,
            photo: { url },
          });
          user
            .save()
            .then((result) => {
              console.log(result);
              res.status(201).json({
                message: "User created",
                data: result,
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({
                error: "aqi" + err,
              });
            });
        }
      });
    });
});

router.post("/login", (req, res, next) => {
  const emailReq = req.body.email.toLowerCase();
  User.findOne({ email: emailReq })
    .exec()
    .then((user) => {
      console.log(user);
      if (user) {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (err) {
            res.status(401).json({
              message: "Não foi possivel autenticar",
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                id: user._id,
                email: user.email,
                username: user.username,
              },
              "GSJsqetMU6nw3",
              { expiresIn: "2h" }
            );
            var refreshToken = randtoken.uid(256);
            user.refreshToken = refreshToken;
            user
              .save()
              .then((result) => {
                console.log(result);
                return res.status(200).json({
                  message: "Autenticado com sucesso",
                  user: {
                    id: user._id,
                    username: user.username,
                    photo: user.photo,
                    email: emailReq,
                    token: token,
                    refreshToken: refreshToken,
                  },
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  error: err,
                });
              });
          } else {
            return res.status(401).json({
              message: "Não foi possível autenticar",
            });
          }
        });
      } else {
        return res.status(401).json({
          message: "Não foi possivel autenticar",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/token", function (req, res, next) {
  const emailReq = req.body.email.toLowerCase();
  User.findOne({ email: emailReq })
    .exec()
    .then((user) => {
      if (user < 1) {
        return res.status(401).json({
          message: "Não foi possível autenticar",
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
              username: user.username,
            },
            "GSJsqetMU6nw3",
            { expiresIn: "2h" }
          );
          var refreshToken = randtoken.uid(256);
          user.refreshToken = refreshToken;
          user
            .save()
            .then((result) => {
              console.log(result);
              return res.status(200).json({
                message: "Atenticado com sucesso",
                user: {
                  token: token,
                  refreshToken: refreshToken,
                },
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({
                error: err,
              });
            });
        } else {
          return res.status(401).json({
            message: "Não foi possivel autenticar",
          });
        }
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
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
