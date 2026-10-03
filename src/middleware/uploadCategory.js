const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Local disk storage for category images.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const abs = path.join(__dirname, '..', '..', 'uploads', 'categories');
    fs.mkdirSync(abs, { recursive: true });
    cb(null, abs);
  },
  filename: (req, file, cb) => {
    const safe = path.basename(file.originalname).replace(/\.[^.]+$/, '');
    const stamp = Date.now();
    const rand = Math.round(Math.random() * 1e9);
    cb(null, `${safe}-${stamp}-${rand}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (ok.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Unsupported image format'));
};

const uploadCategoryImage = multer({ storage, fileFilter });

module.exports = uploadCategoryImage;