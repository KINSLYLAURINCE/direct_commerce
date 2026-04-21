const express = require('express');
const {
  subscribe,
  unsubscribe,
  getSubscribers,
  deleteSubscriber
} = require('../controllers/newsletterController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/subscribers', protect, admin, getSubscribers);
router.delete('/subscribers/:email', protect, admin, deleteSubscriber);

module.exports = router;