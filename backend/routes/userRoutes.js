const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Define the API endpoints for user profiles
router.route('/profile').get(protect, getUserProfile);
router.route('/profile').put(protect, updateUserProfile);
router.route('/profile').delete(protect, deleteUserProfile);

module.exports = router;