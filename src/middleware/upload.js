const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Local disk storage. The DB stores a public path like /uploads/products/main/<file>,
// which server.js serves via express.static.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'main_image'
      ? path.join('uploads', 'products', 'main')
      : path.join('uploads', 'products', 'sub');
    const abs = path.join(__dirname, '..', '..', folder);
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

const upload = multer({ storage, fileFilter });

// Convert an absolute disk path into the public URL stored in the DB.
const publicPath = (file) => {
  const rel = path.relative(path.join(__dirname, '..', '..'), file.path).split(path.sep).join('/');
  return `/${rel}`;
};

module.exports = upload;
module.exports.publicPath = publicPath;