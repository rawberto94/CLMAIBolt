// backend/server.js - Fully Migrated to @google/genai (July 2025)

const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
require('dotenv').config();

const { GoogleGenAI } = require("@google/genai");

// Debug .env load
console.log('Loaded .env. GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'present' : 'missing');

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', ignore: 'pid,hostname' },
  },
});

const config = {
  port: process.env.PORT || 4000,
  geminiApiKey: process.env.GEMINI_API_KEY,
  modelName: 'gemini-2.0-flash',  // Valid model in new SDK
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

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.disable('x-powered-by');

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again after 15 minutes.' },
}));
app.use(express.json());

// GenAI Client Setup
const genAI =