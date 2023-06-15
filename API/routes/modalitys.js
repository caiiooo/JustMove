const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const checkAuth = require("../middleware/check-auth");
const Modality = require("../models/modality");
const ModalityPack = require("../models/modalityPack");
const {upload, bucket} = require("../utils/storage");

router.get("/", (req, res, next) => {
  Modality.find()
    .sort("name")
    .exec()
    .then(docs => {
      const reponse = {
        count: docs.length,
        modalitys: docs
      };
      //   if (docs >= 0) {
      res.status(200).json(reponse);
      //   } else {
      //     res.status(404).json({
      //         message:"No entry found"
      //     });
      //   }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post("/", checkAuth, upload.single("modalityIcon"), (req, res, next) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }
  
  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file('modalitys/'+req.file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on('error', err => {
    console.log(err)
    next(err);
  });

  blobStream.on('finish', () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    const modality = new Modality({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      type: req.body.type,
      icon: publicUrl
    });
    modality
      .save()
      .then(result => {
        console.log(result);
        res.status(201).json({
          message: "Created modality successfuly",
          createdModality: result
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });

  blobStream.end(req.file.buffer);
});

router.get("/pack", (req, res, next) => {
  ModalityPack.find()
    .sort("+name")
    .populate({
      path: "modalitys.modality",
      select: "name"
    })
    .exec()
    .then(docs => {
      const reponse = {
        count: docs.length,
        modalitysPack: docs
      };
      //   if (docs >= 0) {
      res.status(200).json(reponse);
      //   } else {
      //     res.status(404).json({
      //         message:"No entry found"
      //     });
      //   }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post("/pack", (req, res, next) => {
  console.log();
  const modalityPack = new ModalityPack({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    modalitys: req.body.modalitys
  });
  modalityPack
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Created modality pack successfuly",
        createdModality: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get("/:modalityId", (req, res, next) => {
  const id = req.params.modalityId;
  Modality.findById(id)
    .select("name _id")
    .exec()
    .then(doc => {
      console.log(doc);
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({
          message: "No valid entry found!"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

// router.patch("/:modalityId", checkAuth, (req, res, next) => {
//   const id = req.params.modalityId;
//   const updateOps = {};
//   for (const ops of req.body) {
//     updateOps[ops.propName] = ops.value;
//   }
//   Modality.update({ _id: id }, { $set: updateOps })
//     .exec()
//     .then(result => {
//       res.status(200).json({
//         message: "Modality updated",
//         request: {
//           type: "GET",
//           url: "http://localhost:3000/modalitys/" + id
//         }
//       });
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(500).json({
//         error: err
//       });
//     });
// });

// router.delete("/:modalityId", checkAuth, (req, res, next) => {
//   const id = req.params.modalityId;
//   Modality.remove({ _id: id })
//     .exec()
//     .then(result => {
//       res.status(200).json({ message: "Modality deleted successfuly" });
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(500).json({
//         error: err
//       });
//     });
// });


module.exports = router;
