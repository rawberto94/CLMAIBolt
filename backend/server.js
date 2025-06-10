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
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', ignore: 'pid,hostname' },
  },
});

const config = {
  port: process.env.PORT || 4000,
  geminiApiKey: process.env.GEMINI_API_KEY,
  modelName: 'gemini-1.5-flash-latest',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

if (!config.geminiApiKey) {
  logger.error("CRITICAL ERROR: GEMINI_API_KEY is not defined in the .env file.");
  process.exit(1);
}

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ==================================================================
// 3. Security & Middleware Setup
// ==================================================================
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.disable('x-powered-by');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again after 15 minutes.' },
});
app.use('/api', apiLimiter);
app.use(express.json());

// ==================================================================
// 4. Gemini API Client Setup
// ==================================================================
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
// We are removing the explicit JSON mode and will rely on our robust parsing.
// This can sometimes be more reliable than forcing the model's output type.
const model = genAI.getGenerativeModel({ model: config.modelName });

const generationConfig = {
  temperature: 0.2,
  maxOutputTokens: 8192,
};

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// ==================================================================
// 5. Helper Functions
// ==================================================================
async function extractPdfText(buffer) {
  const data = await pdf(buffer);
  if (data.text.length < 100) {
    throw new Error("Could not extract sufficient text. The PDF may be image-based or corrupt.");
  }
  return data.text;
}

/**
 * Extracts a JSON object from a string that might contain extra text or markdown.
 * @param {string} text - The text from the AI's response.
 * @returns {string | null} The cleaned JSON string, or null if not found.
 */
function extractJsonFromString(text) {
  // Find the first '{' and the last '}' to isolate the JSON object.
  const startIndex = text.indexOf('{');
  const endIndex = text.lastIndexOf('}');
  
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return null; // No valid JSON object markers found
  }
  
  const jsonString = text.substring(startIndex, endIndex + 1);
  
  // A final check to ensure the extracted string is likely valid JSON
  try {
    JSON.parse(jsonString);
    return jsonString;
  } catch (error) {
    return null; // The extracted string was not valid JSON
  }
}

async function analyzeContractWithAI(contractText) {
  const prompt = `
    Analyze the following contract and return a structured JSON object.
    The JSON object must strictly adhere to the schema provided below. Do not add any extra fields, comments, or markdown. Your entire response must be only the JSON object itself, starting with { and ending with }.
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
  logger.info("Received raw response from Gemini.");

  const jsonString = extractJsonFromString(responseText);
  
  if (!jsonString) {
    logger.error({ rawResponse: responseText }, "Could not extract a valid JSON object from the AI's response.");
    throw new Error("Failed to parse a valid JSON object from the AI's response.");
  }

  logger.info("Successfully extracted JSON. Parsing now.");
  return JSON.parse(jsonString);
}

// ==================================================================
// 6. API Routes
// ==================================================================
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
    next(error);
  }
});

// ==================================================================
// 7. Error Handling & Server Startup
// ==================================================================
app.use((err, req, res, next) => {
  logger.error({ err: { message: err.message, stack: err.stack }, req: { method: req.method, url: req.originalUrl } }, 'Unhandled error occurred');
  res.status(500).json({ error: 'An internal server error occurred.' });
});

const server = app.listen(config.port, () => {
  logger.info(`Backend server listening at http://localhost:${config.port}`);
});

const cleanup = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Server closed. Exiting.');
    process.exit(0);
  });
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
