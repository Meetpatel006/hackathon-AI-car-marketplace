const User = require('../models/userModel');
const Car = require('../models/carModel');
const TestDrive = require('../models/testDriveModel');

// @desc    Get analytics for the admin dashboard
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCarListings = await Car.countDocuments();
    const totalTestDrives = await TestDrive.countDocuments();

    const recentTestDrives = await TestDrive.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .populate('car', 'make model year');

    res.status(200).json({
      totalUsers,
      totalCarListings,
      totalTestDrives,
      recentTestDrives,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to retrieve analytics' });
  }
};

// @desc    Get all cars (for admin review)
// @route   GET /api/admin/cars
// @access  Private (Admin only)
const getAllCars = async (req, res) => {
  const cars = await Car.find({}).populate('user', 'name email');
  res.status(200).json(cars);
};

// @desc    Get all users (for admin management)
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  const users = await User.find({}).select('-password');
  res.status(200).json(users);
};

// @desc    Get all test drives (for admin review)
// @route   GET /api/admin/testdrives
// @access  Private (Admin only)
const getAllTestDrives = async (req, res) => {
  try {
    const testDrives = await TestDrive.find({})
      .populate('user', 'name email')
      .populate('car', 'make model year');
    res.status(200).json(testDrives);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve test drives' });
  }
};

module.exports = {
  getAnalytics,
  getAllCars,
  getAllUsers,
  getAllTestDrives,
};