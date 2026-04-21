const express = require('express');
const { login, logout, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);

module.exports = router;