const Car = require('../models/carModel');
const User = require('../models/userModel');
const cloudinary = require('../config/cloudinaryConfig');
const { generateCarDescription , analyzeCarImage} = require('../services/aiService');

// @desc    Create a new car listing
// @route   POST /api/cars
// @access  Private (Dealer only)
const createCar = async (req, res) => {
  console.log(req.body)
  const { make, model, year, price, mileage, condition, engine ,transmission , color} = req.body;

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
      engine,
      transmission,
      color
    });

    const newCar = await Car.create({
      user: req.user._id, // Assumes user is authenticated and attached by middleware
      make,
      model,
      year,
      price,
      mileage,
      condition,
      engine,
      transmission,
      color,
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
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image file.' });
  }

  try {
    const base64Image = req.file.buffer.toString('base64');
    const aiResult = await analyzeCarImage(base64Image);
    
    // 1. Extract and clean the year from the AI response
    // Use a regular expression to find the first 4-digit number.
    let year = null;
    if (aiResult.year) {
      const yearMatch = aiResult.year.match(/\b(\d{4})\b/);
      if (yearMatch && yearMatch[1]) {
        year = parseInt(yearMatch[1]);
      }
    }
    
    // 2. Extract make and model as before
    const { make, model } = aiResult;

    // 3. Construct a database query to find similar cars
    const query = {};
    if (make) {
      query.make = { $regex: new RegExp(make, 'i') };
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
  searchByImage,
};