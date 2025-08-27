const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const {CLOUDINARY_NAME,CLOUDINARY_KEY,CLOUDINARY_SECRET} = require("./env");
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'car_marketplace', // This will be the folder in your Cloudinary account
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp','AVIF'],
  },
});

module.exports = { cloudinary, storage };