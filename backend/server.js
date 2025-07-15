// backend/server.js - Minimal Version for Testing

const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
require('dotenv').config();

// Debug .env and startup
console.log('Loaded .env. GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'present' : 'missing');
console.log('Full env vars:', process.env);  // Temporary, to see all vars

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', ignore: 'pid,hostname' },
  },
});

const config = {
  port: process.env.PORT || 4000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

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

// Test route - no AI needed
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handling & Server Startup
app.use((err, req, res, next) => {
  logger.error({ err: { message: err.message, stack: err.stack }, req: { method: req.method, url: req.originalUrl } }, 'Unhandled error occurred');
  res.status(500).json({ error: 'An internal server error occurred.' });
});

const server = app.listen(config.port, () => {
  logger.info(`Backend server listening at http://localhost:${config.port}`);
  console.log('Server is running! Test with curl http://localhost:4000/health');
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