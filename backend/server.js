// backend/server.js

// 1. Import Dependencies
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const cors = require('cors'); // We will use the general cors middleware
require('dotenv').config();

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// 2. Initial Setup
const app = express();
const port = 4000;
const upload = multer({ storage: multer.memoryStorage() });

// 3. Configure Express App

// ==================================================================
// THIS IS THE CORRECTED SECTION
// We are using the general cors() middleware which allows requests from any origin.
// This is suitable for development and should resolve the fetch error.
// ==================================================================
app.use(cors());
// ==================================================================

app.use(express.json());

// ... (The rest of your server.js file remains unchanged) ...

// 4. Configure Gemini Client
const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  generationConfig: {
    responseMimeType: "application/json",
  },
});

const generationConfig = {
  temperature: 0.2,
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];


// 5. Define the Analysis API Endpoint
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  console.log("Received a POST request to /api/analyze");

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are supported.'});
  }

  try {
    console.log("Extracting text from PDF...");
    const pdfData = await pdf(req.file.buffer);
    const contractText = pdfData.text;
    console.log(`Extracted ${contractText.length} characters.`);

    if (contractText.length < 100) {
        return res.status(400).json({ error: "Could not extract sufficient text from the PDF."});
    }

    console.log("Constructing prompt for Gemini...");
    const prompt = `
      As an expert legal analyst, analyze the following contract and return a structured JSON object.
      The JSON object must strictly adhere to this schema:
      { "overview": { "title": "string", "type": "string", ...etc } }
    `; // The full prompt from before

    console.log("Sending request to Gemini API...");
    const parts = [{ text: prompt }];
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });

    const responseText = result.response.text();
    console.log("Received response from Gemini.");
    
    const analysisJson = JSON.parse(responseText);
    res.status(200).json(analysisJson);

  } catch (error) {
    console.error("Error during analysis:", error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});


// 6. Start the Server
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
