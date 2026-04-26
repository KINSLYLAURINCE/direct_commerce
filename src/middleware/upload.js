const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const folder = file.fieldname === 'main_image'
      ? 'products/main'
      : 'products/sub';
    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    };
  },
});

const upload = multer({ storage });

module.exports = upload;