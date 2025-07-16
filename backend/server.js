// backend/server.js - Minimal Version for Testing

const express = require('express');
const pdf = require('pdf-parse');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const { GoogleGenerativeAI } = require('@google/genai');
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
// Configure multer for file uploads
const multer = require('multer');
// Configure multer for file uploads
const upload = multer({ 
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

// Contract analysis endpoint
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    console.log('[server] Received analysis request');
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }
    
    console.log(`[server] Processing file: ${req.file.originalname}`);
    
    // Extract text from PDF
    const pdfData = await pdf(req.file.buffer);
    const text = pdfData.text;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No text could be extracted from the PDF' 
      });
    }
    
    console.log(`[server] Extracted ${text.length} characters from PDF`);
    
    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Create analysis prompt
    const prompt = `Please analyze this contract and provide a detailed analysis in the following JSON format:
    
{
  "overview": {
    "title": "Contract title",
    "parties": ["Party 1", "Party 2"],
    "contractType": "Type of contract",
    "effectiveDate": "Date",
    "expirationDate": "Date",
    "summary": "Brief summary of the contract"
  },
  "financials": {
    "totalValue": "Total contract value",
    "paymentTerms": "Payment terms",
    "rateCards": [
      {
        "role": "Role name",
        "level": "Level",
        "hourlyRate": "Rate",
        "currency": "Currency"
      }
    ]
  },
  "risks": [
    {
      "category": "Risk category",
      "description": "Risk description",
      "severity": "high|medium|low",
      "mitigation": "Mitigation strategy"
    }
  ],
  "recommendations": [
    {
      "category": "Recommendation category",
      "description": "Recommendation description",
      "priority": "high|medium|low"
    }
  ]
}

Contract text: ${text.substring(0, 15000)}`;
    
    console.log('[server] Sending request to Gemini API');
    
    // Generate analysis
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('[server] Received response from Gemini API');
    
    // Try to parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(response);
    } catch (parseError) {
      console.log('[server] Failed to parse JSON, extracting from response...');
      
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse analysis response');
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      analysis: analysis 
    });
    
  } catch (error) {
    console.error('[server] Error analyzing document:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

// Document analysis endpoint
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    logger.info('Received analysis request');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file provided' 
      });
    }
    
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      logger.error('GEMINI_API_KEY not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'AI service is not properly configured' 
      });
    }
    
    // Extract text from PDF
    logger.info(`Processing ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);
    
    let extractedText;
    try {
      const data = await pdf(req.file.buffer);
      extractedText = data.text;
      
      if (extractedText.length < 50) {
        return res.status(400).json({
          success: false,
          error: 'Document contains very little text. Please check if the file is valid.'
        });
      }
      
      logger.info(`Extracted ${extractedText.length} characters of text`);
    } catch (extractError) {
      logger.error({ error: extractError }, 'Failed to extract text from document');
      return res.status(400).json({
        success: false,
        error: 'Failed to extract text from document',
        details: extractError.message
      });
    }
    
    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Create structured prompt for analysis
    const prompt = `
    As a contract analysis expert, analyze the following contract text and extract key information.
    Return a detailed analysis in JSON format with the following structure:
    {
      "overview": {
        "title": "Contract title",
        "type": "Contract type (e.g., MSA, SOW, NDA)",
        "status": "Active/Expired/Draft",
        "parties": ["List of parties involved"],
        "effectiveDate": "Effective date if found",
        "expirationDate": "Expiration date if found",
        "totalValue": "Total contract value if found",
        "description": "Brief description of the contract"
      },
      "financials": {
        "totalValue": 0, 
        "currency": "USD",
        "paymentTerms": {
          "schedule": "Payment schedule",
          "terms": "Payment terms (e.g., Net 30)",
          "latePaymentFee": "Late payment fees",
          "earlyPaymentDiscount": "Early payment discount terms"
        },
        "rateCards": [
          {"role": "Role name", "rate": 0, "unit": "hourly/daily/fixed"}
        ],
        "fees": [
          {"type": "Fee type", "description": "Description", "cap": "Cap amount if any"}
        ],
        "invoicingFrequency": "Monthly/Quarterly/etc.",
        "budgetAllocation": {
          "year1": 0,
          "year2": 0,
          "year3": 0
        }
      },
      "obligations": {
        "deliverables": [
          {"description": "Deliverable description", "deadline": "Deadline date", "status": "On Track/At Risk/Delayed"}
        ],
        "serviceLevel": {
          "availability": "Availability requirements",
          "responseTime": {
            "critical": "Response time for critical issues",
            "high": "Response time for high priority",
            "medium": "Response time for medium priority",
            "low": "Response time for low priority"
          },
          "penalties": "Penalties for SLA violations"
        },
        "reporting": {
          "frequency": "Reporting frequency",
          "contents": ["Required report contents"]
        },
        "keyPersonnel": [
          {"role": "Role title", "replaceability": "Replacement terms"}
        ]
      },
      "risks": [
        {
          "category": "Risk category",
          "description": "Risk description",
          "severity": "High/Medium/Low",
          "impact": "Impact description",
          "mitigation": "Mitigation strategy"
        }
      ],
      "compliance": {
        "score": 0,
        "requirements": [
          {"category": "Requirement category", "status": "Compliant/Partial/Non-Compliant", "details": "Details"}
        ],
        "industryRegulations": [
          {"name": "Regulation name", "status": "Compliant/At Risk/Non-Compliant", "details": "Details"}
        ]
      },
      "recommendations": [
        {
          "priority": "High/Medium/Low",
          "description": "Recommendation description",
          "benefit": "Benefit description",
          "effort": "High/Medium/Low"
        }
      ],
      "benchmarks": {
        "rateComparison": {
          "averageRate": 0,
          "marketAverage": 0,
          "percentile": 0
        },
        "termComparison": {
          "paymentTerms": {"contract": "Contract terms", "marketAverage": "Market average", "status": "favorable/standard/unfavorable"},
          "contractLength": {"contract": "Contract length", "marketAverage": "Market average", "status": "favorable/standard/unfavorable"},
          "terminationNotice": {"contract": "Notice period", "marketAverage": "Market average", "status": "favorable/standard/unfavorable"}
        }
      }
    }

    Important: Return ONLY the JSON with no additional text, markdown formatting, or explanations.
    
    Contract text:
    ${extractedText.substring(0, 25000)}`; // Limit text to avoid token issues
    
    // Generate analysis
    try {
      logger.info('Sending text to AI for analysis');
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Try to parse the response as JSON
      try {
        const analysisResult = JSON.parse(response);
        logger.info('Successfully parsed AI response as JSON');
        
        return res.status(200).json({
          success: true,
          analysis: analysisResult
        });
      } catch (parseError) {
        logger.error({ error: parseError }, 'Failed to parse AI response as JSON');
        
        // Try to extract JSON from the response text (in case the model wrapped it)
        const jsonRegex = /```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/;
        const match = jsonRegex.exec(response);
        
        if (match && (match[1] || match[2])) {
          try {
            const analysisResult = JSON.parse(match[1] || match[2]);
            logger.info('Successfully extracted and parsed JSON from AI response');
            
            return res.status(200).json({
              success: true,
              analysis: analysisResult
            });
          } catch (secondParseError) {
            logger.error('Failed to extract JSON from AI response');
          }
        }
        
        return res.status(500).json({
          success: false,
          error: 'Failed to parse AI analysis results',
          details: 'The AI service did not return properly formatted data'
        });
      }
    } catch (aiError) {
      logger.error({ error: aiError }, 'Error generating analysis with AI');
      return res.status(500).json({
        success: false,
        error: 'Failed to analyze document with AI',
        details: aiError.message
      });
    }
  } catch (error) {
    logger.error({ error }, 'Unexpected error in analyze endpoint');
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred',
      details: error.message
    });
  }
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