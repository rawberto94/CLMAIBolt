// backend/server.js

// 1. Import Dependencies
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// 2. Initial Setup
const app = express();
const port = 4000; // The port our backend will run on
const upload = multer({ storage: multer.memoryStorage() }); // Store uploaded files in memory

// 3. Configure Express App
app.use(cors()); // Enable Cross-Origin Resource Sharing for your frontend
app.use(express.json());

// 4. Configure Gemini Client
const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  // IMPORTANT: This enables JSON output mode
  generationConfig: {
    responseMimeType: "application/json",
  },
});

const generationConfig = {
  temperature: 0.2, // Be more factual
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192,
};

const safetySettings = [
  // Adjust safety settings as needed
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// 5. Define the Analysis API Endpoint
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  console.log("Received a request to /api/analyze");

  // --- Input Validation ---
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are supported at this time.'})
  }

  try {
    // --- Text Extraction ---
    console.log("Extracting text from PDF...");
    const pdfData = await pdf(req.file.buffer);
    const contractText = pdfData.text;
    console.log(`Extracted ${contractText.length} characters.`);

    if (contractText.length < 100) {
        return res.status(400).json({ error: "Could not extract sufficient text from the PDF. It may be an image-only file."});
    }

    // --- Prompt Engineering for Gemini ---
    console.log("Constructing prompt for Gemini...");
    const prompt = `
      As an expert legal analyst, your task is to analyze the following contract text and return a structured JSON object.
      The JSON object must strictly adhere to the schema provided in the "JSON Schema for Analysis" section. Do not add any extra fields or deviate from the specified types.

      CONTRACT TEXT TO ANALYZE:
      ---
      ${contractText}
      ---

      JSON SCHEMA FOR ANALYSIS:
      {
        "overview": { "title": "string", "type": "string", "status": "string", "parties": ["string"], "effectiveDate": "string (YYYY-MM-DD)", "expirationDate": "string (YYYY-MM-DD)", "totalValue": "string", "description": "string" },
        "financials": { "totalValue": "number", "currency": "string (e.g., USD)", "paymentTerms": { "schedule": "string", "terms": "string", "latePaymentFee": "string", "earlyPaymentDiscount": "string" }, "rateCards": [{ "role": "string", "rate": "number", "unit": "string" }], "fees": [{ "type": "string", "description": "string", "cap": "string" }], "invoicingFrequency": "string", "budgetAllocation": { "year1": "number", "year2": "number", "year3": "number" } },
        "obligations": { "deliverables": [{ "description": "string", "deadline": "string", "status": "'On Track' | 'At Risk' | 'Delayed'" }], "serviceLevel": { "availability": "string", "responseTime": { "critical": "string", "high": "string", "medium": "string", "low": "string" }, "penalties": "string" }, "reporting": { "frequency": "string", "contents": ["string"] }, "keyPersonnel": [{ "role": "string", "replaceability": "string" }] },
        "risks": [{ "category": "string", "description": "string", "severity": "'High' | 'Medium' | 'Low'", "impact": "string", "mitigation": "string" }],
        "compliance": { "score": "number (1-100)", "requirements": [{ "category": "string", "status": "'Compliant' | 'Partial' | 'Non-Compliant'", "details": "string" }], "industryRegulations": [{ "name": "string", "status": "'Compliant' | 'At Risk' | 'Non-Compliant'", "details": "string" }] },
        "recommendations": [{ "priority": "'High' | 'Medium' | 'Low'", "description": "string", "benefit": "string", "effort": "'High' | 'Medium' | 'Low'" }],
        "benchmarks": { "rateComparison": { "averageRate": "number", "marketAverage": "number", "percentile": "number" }, "termComparison": { "paymentTerms": { "contract": "string", "marketAverage": "string", "status": "string" }, "contractLength": { "contract": "string", "marketAverage": "string", "status": "string" }, "terminationNotice": { "contract": "string", "marketAverage": "string", "status": "string" } } }
      }
    `;

    // --- Calling the Gemini API ---
    console.log("Sending request to Gemini API...");
    const parts = [{ text: prompt }];
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });

    const responseText = result.response.text();
    console.log("Received response from Gemini.");
    
    // Parse the JSON text and send it to the frontend
    const analysisJson = JSON.parse(responseText);
    res.status(200).json(analysisJson);

  } catch (error) {
    console.error("Error during analysis:", error);
    res.status(500).json({ error: 'An internal error occurred while analyzing the contract.' });
  }
});


// 6. Start the Server
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
