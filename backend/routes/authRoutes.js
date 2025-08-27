const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getUserProfile} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Define the API endpoints for user authentication
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/profile',protect, getUserProfile);

module.exports = router;