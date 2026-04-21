const express = require('express');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');
const uploadCategory = require('../middleware/uploadCategory');

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', protect, admin, uploadCategory.single('image'), createCategory);
router.put('/:id', protect, admin, uploadCategory.single('image'), updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;