const express = require('express');
const router = express.Router();
const {
  createCar,
  getCars,
  getCarById,
  getSellerContact,
  searchByImage
} = require('../controllers/carController');
const { protect } = require('../middlewares/authMiddleware');
const multer = require('multer');
const { storage } = require('../config/cloudinaryConfig'); // Import the new storage object

// Configure multer to use the Cloudinary storage engine
const upload = multer({ storage });

// Define the API endpoints for car listings
router.route('/').get(getCars);
router.route('/:id').get(getCarById);
router.route('/').post(protect, upload.array('images', 5), createCar); // 'images' is the field name for the files
router.route('/:id/contact').get(protect, getSellerContact);
router.post('/search-by-image', searchByImage);

module.exports = router;