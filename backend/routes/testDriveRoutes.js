const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  bookTestDrive,
  getMyTestDrives,
  updateTestDriveStatus,
} = require('../controllers/testDriveController');

// Define the API endpoints for test drive bookings
router.route('/').post(protect, bookTestDrive);
router.route('/my').get(protect, getMyTestDrives);
router.route('/:id').put(protect, updateTestDriveStatus);

module.exports = router;