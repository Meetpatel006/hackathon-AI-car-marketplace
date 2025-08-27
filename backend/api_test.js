const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const {GEMINI_API_KEY} = require("./config/env");

dotenv.config();

// Ensure your .env file has GEMINI_API_KEY=YOUR_API_KEY
const geminiAPIKey = GEMINI_API_KEY;

if (!geminiAPIKey) {
    console.error('GEMINI_API_KEY not found in .env file.');
    process.exit(1);
}

async function testGemini() {
    try {
        const genAI = new GoogleGenerativeAI(geminiAPIKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = "Write a short, fun fact about a car.";

        console.log('Sending request to Gemini AI...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('API call successful! 🎉');
        console.log('---------------------------------');
        console.log(text);
        console.log('---------------------------------');

    } catch (error) {
        console.error('Error connecting to Gemini AI:', error.message);
        console.log('Please check your GEMINI_API_KEY in the .env file.');
    }
}

testGemini();