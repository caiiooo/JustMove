var Multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const storage = new Storage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

exports.upload = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

exports.bucket = bucket;

exports.uploadFiles = (file, folder) => {
  return new Promise((resolve, reject) => {
    const blob = bucket.file(`${folder}/` + file?.originalname);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", err => {
      reject(err);
    });

    blobStream.on("finish", () => {
      resolve(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
    });
    blobStream.end(file?.buffer);
  });
};
