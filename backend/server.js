const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const {PORT} = require('./config/env');

const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const carRoutes = require('./routes/carRoutes');
const testDriveRoutes = require('./routes/testDriveRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();
const port = PORT || 5000;

// Connect to the database
connectDB();

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000', // replace with your frontend origin
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('dev')); 

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/testdrives', testDriveRoutes);
app.use('/api/admin', adminRoutes);

app.get('/',(req,res)=>{
  res.send("welcome to the AI Car MarketPlace!");
})

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});