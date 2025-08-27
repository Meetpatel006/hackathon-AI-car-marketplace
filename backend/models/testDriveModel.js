const mongoose = require('mongoose');

const testDriveSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Car',
    },
    date: {
      type: Date,
      required: [true, 'Please select a date'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Please select a time slot'],
    },
    status: {
      type: String,
      enum: ['booked', 'confirmed', 'completed', 'canceled'],
      default: 'booked',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TestDrive', testDriveSchema);