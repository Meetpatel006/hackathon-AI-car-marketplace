const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const {JWT_SECRET} = require('../config/env')

const protect = async (req, res, next) => {
  let token;

  // Check for the token in cookies
  if (req.cookies.token) {
    try {
      token = req.cookies.token;

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from the token and attach to request object
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };