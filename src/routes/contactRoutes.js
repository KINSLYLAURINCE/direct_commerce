const express = require('express');
const {
  createContactMessage,
  getContactMessages,
  getContactMessageById,
  deleteContactMessage
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.post('/', createContactMessage);
router.get('/', protect, admin, getContactMessages);
router.get('/:id', protect, admin, getContactMessageById);
router.delete('/:id', protect, admin, deleteContactMessage);

module.exports = router;