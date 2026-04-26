const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const productMainStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'products/main',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
});

const productSubStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'products/sub',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
});

const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
});

const uploadProductMain = multer({ storage: productMainStorage });
const uploadProductSub = multer({ storage: productSubStorage });
const uploadCategoryImage = multer({ storage: categoryStorage });

module.exports = {
  cloudinary,
  uploadProductMain,
  uploadProductSub,
  uploadCategoryImage,
};