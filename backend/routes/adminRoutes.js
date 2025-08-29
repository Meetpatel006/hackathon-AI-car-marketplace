const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { admin } = require('../middlewares/adminMiddleware');
const {
  getAnalytics,
  getAllCars,
  getAllUsers,
  getAllTestDrives,
} = require('../controllers/adminController');

// Define the API endpoints for the admin dashboard.
// The `protect` middleware ensures the user is logged in, and the `admin`
// middleware ensures they have the correct role.
router.get('/analytics', protect, admin, getAnalytics);
router.get('/cars', protect, admin, getAllCars);
router.get('/users', protect, admin, getAllUsers);
router.get('/testdrives', protect, admin, getAllTestDrives);

module.exports = router;