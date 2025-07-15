// backend/server.js - Corrected & Migrated to @google/genai

const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
require('dotenv').config();

const { GoogleGenAI } = require("@google/genai");

// Debug .env load (temporary, remove after testing)
console.log('Loaded .env. GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'present' : 'missing');

// Configuration & Initialization
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', ignore: 'pid,hostname' },
  },
});

const config = {
  port: process.env.PORT || 4000,
  geminiApiKey: process.env.GEMINI_API_KEY,
  modelName: 'gemini-2.5-flash',
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

// Security & Middleware Setup
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

// GenAI Client Setup (moved after config)
const genAI = new GoogleGenAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({
  model: config.modelName,
  generationConfig: {
    temperature: 0.2,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json'
  },
  safetySettings: [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  ],
});

// Helper Functions
async function extractPdfText(buffer) {
  const data = await pdf(buffer);
  if (data.text.length < 100) {
    throw new Error("Could not extract sufficient text from the PDF.");
  }
  return data.text;
}

async function analyzeContractWithAI(contractText) {
  const prompt = `
    Analyze the following contract and return a structured JSON object.
    Your entire response must contain only the JSON object itself, starting with { and ending with }.
    All fields in the JSON schema are optional. If you cannot find information for a specific field,
    OMIT THE FIELD ENTIRELY from the response. Do not invent data or return empty strings for missing information.

    JSON SCHEMA:
    { "overview": { "title": "string", "type": "string", "status": "string", "parties": ["string"], "effectiveDate": "string (YYYY-MM-DD)", "expirationDate": "string (YYYY-MM-DD)", "totalValue": "string", "description": "string" }, "financials": { "totalValue": "number", "currency": "string (e.g., USD)", "paymentTerms": { "schedule": "string", "terms": "string", "latePaymentFee": "string", "earlyPaymentDiscount": "string" }, "rateCards": [{ "role": "string", "rate": "number", "unit": "string" }], "fees": [{ "type": "string", "description": "string", "cap": "string" }], "invoicingFrequency": "string", "budgetAllocation": { "year1": "number", "year2": "number", "year3": "number" } }, "obligations": { "deliverables": [{ "description": "string", "deadline": "string", "status": "'On Track' | 'At Risk' | 'Delayed'" }], "serviceLevel": { "availability": "string", "responseTime": { "critical": "string", "high": "string", "medium": "string", "low": "string" }, "penalties": "string" }, "reporting": { "frequency": "string", "contents": ["string"] }, "keyPersonnel": [{ "role": "string", "replaceability": "string" }] }, "risks": [{ "category": "string", "description": "string", "severity": "'High' | 'Medium' | 'Low'", "impact": "string", "mitigation": "string" }], "compliance": { "score": "number (1-100)", "requirements": [{ "category": "string", "status": "'Compliant' | 'Partial' | 'Non-Compliant'", "details": "string" }], "industryRegulations": [{ "name": "string", "status": "'Compliant' | 'At Risk' | 'Non-Compliant'", "details": "string" }] }, "recommendations": [{ "priority": "'High' | 'Medium' | 'Low'", "description": "string", "benefit": "string", "effort": "'High' | 'Medium' | 'Low'" }], "benchmarks": { "rateComparison": { "averageRate": "number", "marketAverage": "number", "percentile": "number" }, "termComparison": { "paymentTerms": { "contract": "string", "marketAverage": "string", "status": "string" }, "contractLength": { "contract": "string", "marketAverage": "string", "status": "string" }, "terminationNotice": { "contract": "string", "marketAverage": "string", "status": "string" } } } }

    CONTRACT TEXT:
    ---
    ${contractText}
    ---
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  logger.info("Received raw response from Gemini.");

  try {
    return JSON.parse(responseText);  // Native JSON - no regex needed
  } catch (error) {
    logger.error({ jsonParseError: error.message, responseText }, "Failed to parse JSON.");
    throw new Error("Failed to parse the AI's response.");
  }
}

// API Routes
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
    requestLog.error({ err: { message: error.message, stack: error.stack } }, 'An error occurred during the analysis pipeline.');
    next(error);
  }
});

// Error Handling & Server Startup
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