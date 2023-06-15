const sharp = require("sharp");

exports.reduceImageSize = async (image) => {
  sharp(image)
    .resize({ height: 100 })
    .toBuffer()
    .then((data) => {
      return data;
      // 100 pixels high, auto-scaled width
    })
    .catch((err) => {
      console.log("err: ", err);
    });
};
