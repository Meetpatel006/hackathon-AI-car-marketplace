const User = require('../models/userModel');
const Car = require('../models/carModel');
const TestDrive = require('../models/testDriveModel');

// @desc    Get analytics for the admin dashboard
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCars = await Car.countDocuments();
    const totalTestDrives = await TestDrive.countDocuments();

    const bookedSlots = await TestDrive.find({ status: 'booked' }).populate('user', 'name').populate('car', 'make model year');

    res.status(200).json({
      totalUsers,
      totalCars,
      totalTestDrives,
      bookedSlots,
    });
  } catch (error) {
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

module.exports = {
  getAnalytics,
  getAllCars,
  getAllUsers,
};