const {config} =require("dotenv");

config({path : `.env`});
module.exports={
    PORT,
    MONGO_URI,
    JWT_SECRET,
    CLOUDINARY_NAME,CLOUDINARY_SECRET,CLOUDINARY_KEY,
    GEMINI_API_KEY,NODE_ENV
}=process.env;
