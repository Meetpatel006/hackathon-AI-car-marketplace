const mongoose = require('mongoose');

const carSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    make: {
      type: String,
      required: [true, 'Please add a car make'],
    },
    model: {
      type: String,
      required: [true, 'Please add a car model'],
    },
    year: {
      type: Number,
      required: [true, 'Please add the car year'],
    },
    price: {
      type: Number,
      required: [true, 'Please add the price'],
    },
    mileage: {
      type: Number,
      required: [true, 'Please add the car mileage'],
    },
    condition: {
      type: String,
      enum: ['New', 'Used', 'Certified Pre-Owned','Fair','Excellent','Poor','Good'],
      required: [true, 'Please specify the condition'],
    },
    description: {
      type: String,
      required: false, // AI-generated
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    details: {
      engine: String,
      transmission: String,
      color: String,
      // More fields can be added here
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Car', carSchema);