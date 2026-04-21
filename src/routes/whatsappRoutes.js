const express = require('express');
const {
  createWhatsappInquiry,
  getInquiries,
  getInquiryById,
  deleteInquiry
} = require('../controllers/whatsappController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.post('/', createWhatsappInquiry);
router.get('/', protect, admin, getInquiries);
router.get('/:id', protect, admin, getInquiryById);
router.delete('/:id', protect, admin, deleteInquiry);

module.exports = router;