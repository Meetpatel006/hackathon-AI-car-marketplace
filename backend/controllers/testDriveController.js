const TestDrive = require('../models/testDriveModel');
const Car = require('../models/carModel');

// @desc    Book a new test drive slot
// @route   POST /api/testdrives
// @access  Private (User/Dealer)
const bookTestDrive = async (req, res) => {
  const { carId, date, timeSlot } = req.body;

  if (!carId || !date || !timeSlot) {
    return res.status(400).json({ message: 'Please provide car ID, date, and time slot' });
  }

  const car = await Car.findById(carId);

  if (!car) {
    return res.status(404).json({ message: 'Car not found' });
  }

  // Check if a similar test drive slot is already booked for this car on the same date and time
  const existingBooking = await TestDrive.findOne({
    car: carId,
    date: new Date(date),
    timeSlot: timeSlot
  });

  if (existingBooking) {
    return res.status(400).json({ message: 'This slot is already booked for this car' });
  }

  try {
    const testDrive = await TestDrive.create({
      user: req.user._id,
      car: carId,
      date: new Date(date),
      timeSlot: timeSlot,
    });
    res.status(201).json(testDrive);
  } catch (error) {
    res.status(500).json({ message: 'Failed to book test drive' });
  }
};

// @desc    Get all test drives for the logged-in user
// @route   GET /api/testdrives/my
// @access  Private
const getMyTestDrives = async (req, res) => {
  const testDrives = await TestDrive.find({ user: req.user._id }).populate('car', 'make model year');
  res.status(200).json(testDrives);
};

// @desc    Update the status of a test drive
// @route   PUT /api/testdrives/:id
// @access  Private (Admin/Dealer)
const updateTestDriveStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['confirmed', 'completed', 'canceled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Please provide a valid status' });
  }

  const testDrive = await TestDrive.findById(req.params.id);

  if (!testDrive) {
    return res.status(404).json({ message: 'Test drive booking not found' });
  }

  // A user can only update their own bookings
  if (testDrive.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this booking' });
  }

  testDrive.status = status;
  await testDrive.save();
  res.status(200).json(testDrive);
};

module.exports = {
  bookTestDrive,
  getMyTestDrives,
  updateTestDriveStatus,
};