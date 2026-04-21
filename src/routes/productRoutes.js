const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', 
  protect, 
  admin, 
  upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'sub_images', maxCount: 10 }
  ]), 
  createProduct
);
router.put('/:id', 
  protect, 
  admin, 
  upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'sub_images', maxCount: 10 }
  ]), 
  updateProduct
);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;