// backend/server.js - Advanced, Robust & Secure Version

// ==================================================================
// 1. Import Dependencies
// ==================================================================
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
require('dotenv').config();

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// ==================================================================
// 2. Configuration & Initialization
// ==================================================================

// Setup a structured logger. In production, you would write to a file.
// For development, `pino-pretty` makes the logs human-readable.
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    },
  },
});

// Centralized configuration from environment variables
const config = {
  port: process.env.PORT || 4000,
  geminiApiKey: process.env.GEMINI_API_KEY,
  modelName: 'gemini-1.5-flash-latest',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Default to your Vite dev server
};

// Validate critical configuration
if (!config.geminiApiKey) {
  logger.error("CRITICAL ERROR: GEMINI_API_KEY is not defined in the .env file.");
  process.exit(1);
}

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
});

// ==================================================================
// 3. Security & Middleware Setup
// ==================================================================

// Set security-related HTTP headers
app.use(helmet());

// Configure CORS to only allow requests from your frontend's domain
const corsOptions = {
  origin: config.corsOrigin,
};
app.use(cors(corsOptions));

// Disable the 'x-powered-by' header to hide server technology
app.disable('x-powered-by');

// Apply rate limiting to all API requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again after 15 minutes.' },
});
app.use('/api', apiLimiter);

// Middleware to parse JSON bodies
app.use(express.json());

// ==================================================================
// 4. Gemini API Client Setup
// ==================================================================
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({
  model: config.modelName,
  generationConfig: { responseMimeType: "application/json" },
});

const generationConfig = {
  temperature: 0.2,
  maxOutputTokens: 8192,
};

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// ==================================================================
// 5. Helper Functions (for modularity and testing)
// ==================================================================

/**
 * Extracts text content from a PDF buffer.
 * @param {Buffer} buffer - The buffer containing the PDF file data.
 * @returns {Promise<string>} The extracted text content.
 */
async function extractPdfText(buffer) {
  const data = await pdf(buffer);
  if (data.text.length < 100) {
    throw new Error("Could not extract sufficient text. The PDF may be image-based or corrupt.");
  }
  return data.text;
}

/**
 * Constructs the prompt and calls the Gemini API.
 * @param {string} contractText - The text of the contract to analyze.
 * @returns {Promise<object>} The parsed JSON object from the AI's response.
 */
async function analyzeContractWithAI(contractText) {
  const prompt = `
    You are an expert legal and financial analyst. Analyze the following contract and return a structured JSON object.
    The JSON object must strictly adhere to the schema provided below. Do not add any extra fields, comments, or markdown. Your entire response must be only the JSON object itself.
    JSON SCHEMA:
    { "overview": { "title": "string", "type": "string", "status": "string", "parties": ["string"], "effectiveDate": "string (YYYY-MM-DD)", "expirationDate": "string (YYYY-MM-DD)", "totalValue": "string", "description": "string" }, "financials": { "totalValue": "number", "currency": "string (e.g., USD)", "paymentTerms": { "schedule": "string", "terms": "string", "latePaymentFee": "string", "earlyPaymentDiscount": "string" }, "rateCards": [{ "role": "string", "rate": "number", "unit": "string" }], "fees": [{ "type": "string", "description": "string", "cap": "string" }], "invoicingFrequency": "string", "budgetAllocation": { "year1": "number", "year2": "number", "year3": "number" } }, "obligations": { "deliverables": [{ "description": "string", "deadline": "string", "status": "'On Track' | 'At Risk' | 'Delayed'" }], "serviceLevel": { "availability": "string", "responseTime": { "critical": "string", "high": "string", "medium": "string", "low": "string" }, "penalties": "string" }, "reporting": { "frequency": "string", "contents": ["string"] }, "keyPersonnel": [{ "role": "string", "replaceability": "string" }] }, "risks": [{ "category": "string", "description": "string", "severity": "'High' | 'Medium' | 'Low'", "impact": "string", "mitigation": "string" }], "compliance": { "score": "number (1-100)", "requirements": [{ "category": "string", "status": "'Compliant' | 'Partial' | 'Non-Compliant'", "details": "string" }], "industryRegulations": [{ "name": "string", "status": "'Compliant' | 'At Risk' | 'Non-Compliant'", "details": "string" }] }, "recommendations": [{ "priority": "'High' | 'Medium' | 'Low'", "description": "string", "benefit": "string", "effort": "'High' | 'Medium' | 'Low'" }], "benchmarks": { "rateComparison": { "averageRate": "number", "marketAverage": "number", "percentile": "number" }, "termComparison": { "paymentTerms": { "contract": "string", "marketAverage": "string", "status": "string" }, "contractLength": { "contract": "string", "marketAverage": "string", "status": "string" }, "terminationNotice": { "contract": "string", "marketAverage": "string", "status": "string" } } } }
    CONTRACT TEXT:
    ---
    ${contractText}
    ---
  `;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig,
    safetySettings,
  });

  const responseText = result.response.text();

  // Robust JSON parsing
  const startIndex = responseText.indexOf('{');
  const endIndex = responseText.lastIndexOf('}');
  if (startIndex === -1 || endIndex === -1) {
    logger.warn({ rawResponse: responseText }, "AI response did not contain a valid JSON object.");
    throw new Error("Could not parse a valid JSON object from the AI's response.");
  }
  const jsonString = responseText.substring(startIndex, endIndex + 1);
  
  // ==================================================================
  // DEBUGGING: Log the exact string we are about to parse.
  // ==================================================================
  logger.info({ jsonStringToParse: jsonString }, "Attempting to parse the final JSON string.");

  return JSON.parse(jsonString);
}

// ==================================================================
// 6. API Routes
// ==================================================================

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main analysis endpoint
app.post('/api/analyze', upload.single('file'), async (req, res, next) => {
  const requestLog = logger.child({ requestId: Math.random().toString(36).substring(7) });
  requestLog.info(`Received request to /api/analyze from IP: ${req.ip}`);

  if (!req.file) {
    requestLog.warn('Analysis request failed: No file uploaded.');
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    requestLog.info(`Extracting text from PDF: ${req.file.originalname}`);
    const contractText = await extractPdfText(req.file.buffer);
    requestLog.info(`Text extracted. Length: ${contractText.length}. Sending to AI.`);

    const analysisJson = await analyzeContractWithAI(contractText);
    requestLog.info('Successfully received and parsed AI response.');

    res.status(200).json(analysisJson);
  } catch (error) {
    requestLog.error({ err: error }, 'An error occurred during the analysis pipeline.');
    // Pass the error to the global error handler
    next(error);
  }
});

// ==================================================================
// 7. Error Handling & Server Startup
// ==================================================================

// Global error handling middleware. All `next(error)` calls end up here.
app.use((err, req, res, next) => {
  logger.error({
    err: {
      message: err.message,
      stack: err.stack,
    },
    req: {
      method: req.method,
      url: req.originalUrl,
    },
  }, 'Unhandled error occurred');

  res.status(500).json({ error: 'An internal server error occurred.' });
});

const server = app.listen(config.port, () => {
  logger.info(`Backend server listening at http://localhost:${config.port}`);
});

// Graceful shutdown logic
const cleanup = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Server closed. Exiting.');
    process.exit(0);
  });
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
