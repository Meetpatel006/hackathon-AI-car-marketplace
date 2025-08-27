const Car = require('../models/carModel');
const User = require('../models/userModel');
const cloudinary = require('../config/cloudinaryConfig');
const { generateCarDescription , analyzeCarImage} = require('../services/aiService');

// @desc    Create a new car listing
// @route   POST /api/cars
// @access  Private (Dealer only)
const createCar = async (req, res) => {
  const { make, model, year, price, mileage, condition, details } = req.body;

  console.log(details);

  // The files are already uploaded to Cloudinary by the multer middleware
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'Please upload at least one image' });
  }

  try {
    // Extract the image URLs and public IDs directly from req.files
    const images = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
    }));

    // Use the AI service to generate a description
    const aiGeneratedDescription = await generateCarDescription({
      make,
      model,
      year,
      mileage,
      condition,
      details,
    });

    const newCar = await Car.create({
      user: req.user._id, // Assumes user is authenticated and attached by middleware
      make,
      model,
      year,
      price,
      mileage,
      condition,
      details,
      description: aiGeneratedDescription,
      images,
    });

    res.status(201).json(newCar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all cars
// @route   GET /api/cars
// @access  Public
const getCars = async (req, res) => {
  const cars = await Car.find({}).populate('user', 'name');
  res.status(200).json(cars);
};

// @desc    Get a single car by ID
// @route   GET /api/cars/:id
// @access  Public
const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get seller contact information for a specific car
// @route   GET /api/cars/:id/contact
// @access  Private
const getSellerContact = async (req, res) => {
  try {
    // Populate the 'user' field to get the seller's full details
    const car = await Car.findById(req.params.id).populate('user'); 

    if (!car || !car.user) {
      return res.status(404).json({ message: 'Car or seller not found' });
    }
    
    // Construct the response object with all the required seller info
    const sellerInfo = {
      name: car.user.name,
      email: car.user.email,
      phoneNumber: car.user.phoneNumber,
      address: car.user.address,
    };

    res.status(200).json(sellerInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search for cars by analyzing an uploaded image
// @route   POST /api/cars/search-by-image
// @access  Public
const searchByImage = async (req, res) => {
  const { base64Image } = req.body;

  if (!base64Image) {
    return res.status(400).json({ message: 'Please provide a base64 encoded image.' });
  }

  try {
    // 1. Use AI to analyze the image and get car details
    const aiResult = await analyzeCarImage(base64Image);
    
    // 2. Extract key details for the database search
    const { make, model, year } = aiResult;

    // 3. Construct a database query to find similar cars
    const query = {};
    if (make) {
      query.make = { $regex: new RegExp(make, 'i') }; // Case-insensitive search
    }
    if (model) {
      query.model = { $regex: new RegExp(model, 'i') };
    }
    if (year) {
      // Find cars from the same year or a small range around it
      query.year = { $gte: year - 2, $lte: year + 2 };
    }

    // 4. Find matching cars in the database
    const matchingCars = await Car.find(query);

    // 5. Return the results
    if (matchingCars.length > 0) {
      res.status(200).json(matchingCars);
    } else {
      res.status(404).json({ message: 'No similar cars found. Please try a different image or search manually.' });
    }
  } catch (error) {
    console.error('Error during image-based search:', error);
    res.status(500).json({ message: 'Error analyzing image or searching for cars.' });
  }
};

module.exports = {
  createCar,
  getCars,
  getCarById,
  getSellerContact,
  searchByImage, // Export the new function
};