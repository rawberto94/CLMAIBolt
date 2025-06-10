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
const port = 4000;
const upload = multer({ storage: multer.memoryStorage() }); // Store uploaded files in memory

// 3. Configure Express App
app.use(cors()); // Allows requests from any origin, which is suitable for development
app.use(express.json());

// 4. Configure Gemini Client
const MODEL_NAME = "gemini-1.5-flash-latest"; // Corrected model name
const API_KEY = process.env.GEMINI_API_KEY;

// ==================================================================
// DEBUGGING BLOCK: Check if the API Key is loaded correctly.
// ==================================================================
console.log(`Checking for API Key... Found: ${API_KEY ? 'Yes' : 'No'}`);
if (!API_KEY) {
  console.error("\nCRITICAL ERROR: GEMINI_API_KEY is not defined.");
  console.error("Please ensure you have a .env file in the /backend folder with your key:\n");
  console.error("Example .env file content:\nGEMINI_API_KEY=\"AIzaSy...\"\n");
  process.exit(1); // Stop the server if the key is missing
}
// ==================================================================

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  // This enables JSON output mode, which is crucial for reliable results.
  generationConfig: {
    responseMimeType: "application/json",
  },
});

const generationConfig = {
  temperature: 0.2, // Lower temperature for more factual, less creative output
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192,
};

const safetySettings = [
  // You can adjust these safety settings as needed for your use case
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// 5. Define the API Endpoint for Contract Analysis
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
    console.log(`Extracting text from PDF: ${req.file.originalname}...`);
    const pdfData = await pdf(req.file.buffer);
    const contractText = pdfData.text;
    console.log(`Extracted ${contractText.length} characters.`);

    if (contractText.length < 100) {
        return res.status(400).json({ error: "Could not extract sufficient text from the PDF. It may be an image-only file."});
    }

    // --- Prompt Engineering for Gemini ---
    console.log("Constructing prompt for Gemini...");
    // This detailed prompt guides the AI to produce the exact JSON structure we need.
    const prompt = `
      You are an expert legal and financial analyst. Your task is to perform a comprehensive analysis of the following contract text and return a structured JSON object.
      The JSON object must strictly adhere to the schema provided below. Do not add any extra fields, comments, or deviate from the specified data types.

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

    // ==================================================================
    // THIS IS THE FIX
    // Clean the response text to remove the Markdown wrapper before parsing.
    // ==================================================================
    const cleanedText = responseText.replace(/^```json\s*/, '').replace(/```$/, '');
    
    // Parse the cleaned JSON text and send it to the frontend
    const analysisJson = JSON.parse(cleanedText);
    res.status(200).json(analysisJson);

  } catch (error) {
    // This will catch errors from the Gemini API or JSON parsing
    console.error("Error during analysis:", error);
    res.status(500).json({ error: 'An internal server error occurred while analyzing the contract.' });
  }
});


// 6. Start the Server
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
