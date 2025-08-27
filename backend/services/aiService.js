const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const {GEMINI_API_KEY}=require('../config/env');

dotenv.config();

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const generateCarDescription = async ({ make, model, year, mileage, condition, details }) => {
  try {
    const prompt = `As a professional car dealer, write a brief, well-structured, and engaging description for a used car. The description should sound like a real person wrote it and should be formatted for easy reading.
       
      Car Specifications:
      - Make: ${make}
      - Model: ${model}
      - Year: ${year}
      - Mileage: ${mileage} miles
      - Condition: ${condition}
      - Details: ${JSON.stringify(details, null, 2)}
      
      Key requirements:
      1. Start with an eye-catching headline.
      2. The description should be 2-3 short paragraphs, not a single long block of text.
      3. Highlight key features like the engine, transmission, and color.
      4. Use a friendly, persuasive tone.
      5. End with a call to action, encouraging the buyer to contact you or schedule a test drive.`;
       
    // Changed model from 'gemini-pro' to 'gemini-1.5-flash'
    const aiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;

  } catch (error) {
    console.error('Error generating AI description:', error);
    throw new Error('Could not generate car description.');
  }
};

const analyzeCarImage = async (base64Image) => {
  try {
    // Also change this model for consistency
    const aiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg',
      },
    };

    const prompt = `Analyze this car image. Provide a detailed description including the car's make, model, year, color, and any visible features like body style or trim. Respond in a JSON object with 'make', 'model', 'year', 'color' and 'description' keys. If the model or year is not specified, you can give a best guess or state it's unknown.`;

    const result = await aiModel.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);

  } catch (error) {
    console.error('Error analyzing image with AI:', error);
    throw new Error('Could not analyze car image.');
  }
};

module.exports = {
  generateCarDescription,
  analyzeCarImage,
};