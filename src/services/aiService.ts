// src/services/aiService.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Import your existing AnalysisResult type
import { AnalysisResult } from '../types/Contracts';

export interface StructuredAnalysisResponse {
  success: boolean;
  error?: string;
  analysis?: AnalysisResult | string | null;
}

// Initialize the Gemini client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Gemini API key is not set. Please check your environment variables.");
}

const client = new GoogleGenerativeAI(apiKey);
const modelName = 'gemini-1.5-pro-latest';

// Contract analysis prompt template that matches your AnalysisResult structure
const createContractAnalysisPrompt = (contractText: string, taxonomy: string = 'standard'): string => {
  return `You are an expert contract analyst. Analyze the following contract and provide a comprehensive analysis in JSON format that matches the specified structure.

Contract Text:
${contractText}

Please provide your analysis in the following exact JSON structure:

{
  "overview": {
    "title": "Contract title or description",
    "type": "Contract type (e.g., Service Agreement, Software License, etc.)",
    "status": "Active|Draft|Expired|Terminated",
    "parties": ["Party 1", "Party 2"],
    "effectiveDate": "YYYY-MM-DD or 'Not specified'",
    "expirationDate": "YYYY-MM-DD or 'Not specified'",
    "totalValue": "Contract value description",
    "description": "Brief description of the contract purpose"
  },
  "financials": {
    "totalValue": 0,
    "currency": "USD",
    "paymentTerms": {
      "schedule": "Payment schedule description",
      "terms": "Payment terms details",
      "latePaymentFee": "Late payment fee details",
      "earlyPaymentDiscount": "Early payment discount details"
    },
    "rateCards": [
      {
        "role": "Role name",
        "rate": 0,
        "unit": "hour|day|month"
      }
    ],
    "fees": [
      {
        "type": "Fee type",
        "description": "Fee description",
        "cap": "Fee cap if any"
      }
    ],
    "invoicingFrequency": "Monthly|Quarterly|etc.",
    "budgetAllocation": {
      "year1": 0,
      "year2": 0,
      "year3": 0
    }
  },
  "obligations": {
    "deliverables": [
      {
        "description": "Deliverable description",
        "deadline": "YYYY-MM-DD or description",
        "status": "On Track|At Risk|Delayed"
      }
    ],
    "serviceLevel": {
      "availability": "Availability percentage or description",
      "responseTime": {
        "critical": "Response time for critical issues",
        "high": "Response time for high priority",
        "medium": "Response time for medium priority",
        "low": "Response time for low priority"
      },
      "penalties": "Penalty descriptions"
    },
    "reporting": {
      "frequency": "Reporting frequency",
      "contents": ["Report content 1", "Report content 2"]
    },
    "keyPersonnel": [
      {
        "role": "Personnel role",
        "replaceability": "Easy|Difficult|Not allowed"
      }
    ]
  },
  "risks": [
    {
      "category": "Risk category",
      "description": "Risk description",
      "severity": "High|Medium|Low",
      "impact": "Impact description",
      "mitigation": "Mitigation strategy"
    }
  ],
  "compliance": {
    "score": 85,
    "requirements": [
      {
        "category": "Requirement category",
        "status": "Compliant|Partial|Non-Compliant",
        "details": "Compliance details"
      }
    ],
    "industryRegulations": [
      {
        "name": "Regulation name",
        "status": "Compliant|At Risk|Non-Compliant",
        "details": "Regulation compliance details"
      }
    ]
  },
  "recommendations": [
    {
      "priority": "High|Medium|Low",
      "description": "Recommendation description",
      "benefit": "Expected benefit",
      "effort": "High|Medium|Low"
    }
  ],
  "benchmarks": {
    "rateComparison": {
      "averageRate": 0,
      "marketAverage": 0,
      "percentile": 0
    },
    "termComparison": {
      "paymentTerms": {
        "contract": "Contract payment terms",
        "marketAverage": "Market average payment terms",
        "status": "Above Average|Average|Below Average"
      },
      "contractLength": {
        "contract": "Contract length",
        "marketAverage": "Market average length",
        "status": "Above Average|Average|Below Average"
      },
      "terminationNotice": {
        "contract": "Contract termination notice",
        "marketAverage": "Market average notice",
        "status": "Above Average|Average|Below Average"
      }
    }
  }
}

Analysis Guidelines:
- Extract all financial information including rates, fees, payment terms
- Identify key obligations and deliverables for each party
- Assess risks and provide practical mitigation strategies
- Evaluate compliance with standard business practices
- Provide actionable recommendations for improvement
- Compare terms with industry standards where possible
- Focus on contractual obligations, deadlines, and penalties
- Identify any unusual or potentially problematic clauses
- Be thorough but concise in your analysis

Taxonomy: ${taxonomy}

Return ONLY the JSON object, no additional text or markdown formatting.`;
};

export async function analyzeContractWithAI(
  contractText: string,
  taxonomy: string = 'standard',
  expectJson: boolean = true
): Promise<StructuredAnalysisResponse> {
  try {
    console.log('[aiService] Starting contract analysis with Gemini');

    if (!contractText || contractText.trim() === '') {
      console.warn('[aiService] No contract text provided');
      return {
        success: false,
        error: 'No contract text provided for analysis',
        analysis: null,
      };
    }

    if (!apiKey) {
      console.error('[aiService] Gemini API key not configured');
      return {
        success: false,
        error: 'AI service not properly configured. Please check API key.',
        analysis: null,
      };
    }

    const model = client.getGenerativeModel({
      model: modelName,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      generationConfig: expectJson ? { 
        responseMimeType: "application/json",
        temperature: 0.1, // Lower temperature for more consistent JSON output
      } : undefined
    });

    const prompt = createContractAnalysisPrompt(contractText, taxonomy);
    console.log('[aiService] Sending analysis request to Gemini...');

    const result = await model.generateContent(prompt);
    const response = result.response;

    if (!response) {
      console.error('[aiService] Empty response from Gemini');
      return {
        success: false,
        error: 'Failed to get response from AI service',
        analysis: null,
      };
    }

    const responseText = response.text();
    console.log('[aiService] Received response from Gemini');

    if (expectJson) {
      try {
        // Try to clean and parse the JSON response
        let jsonString = responseText.trim();
        
        // Remove markdown code blocks if present
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = jsonRegex.exec(jsonString);
        if (match) {
          jsonString = match[1];
        }

        // Remove any leading/trailing whitespace and ensure it starts with {
        jsonString = jsonString.trim();
        if (!jsonString.startsWith('{')) {
          // Try to find the first { and last }
          const startIndex = jsonString.indexOf('{');
          const endIndex = jsonString.lastIndexOf('}');
          if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            jsonString = jsonString.substring(startIndex, endIndex + 1);
          }
        }

        const parsedAnalysis = JSON.parse(jsonString) as AnalysisResult;
        
        // Validate the structure has required fields
        if (!parsedAnalysis.overview || !parsedAnalysis.risks || !Array.isArray(parsedAnalysis.risks)) {
          throw new Error('Invalid analysis structure received from AI');
        }

        console.log('[aiService] Successfully parsed contract analysis');
        return {
          success: true,
          analysis: parsedAnalysis,
        };

      } catch (parseError) {
        console.error('[aiService] Failed to parse JSON response:', parseError);
        console.error('[aiService] Raw response:', responseText.substring(0, 500) + '...');
        
        // Fallback: return as plain text if JSON parsing fails
        return {
          success: false,
          error: `Failed to parse structured analysis: ${(parseError as Error).message}`,
          analysis: responseText,
        };
      }
    } else {
      console.log('[aiService] Returning plain text analysis');
      return {
        success: true,
        analysis: responseText,
      };
    }

  } catch (error) {
    console.error('[aiService] Error in contract analysis:', error);
    
    let errorMessage = 'An unexpected error occurred during analysis';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific Gemini API errors
      if (errorMessage.includes('API_KEY')) {
        errorMessage = 'Invalid or missing API key for AI service';
      } else if (errorMessage.includes('quota')) {
        errorMessage = 'AI service quota exceeded. Please try again later.';
      } else if (errorMessage.includes('safety')) {
        errorMessage = 'Content was blocked by AI safety filters';
      }
    }

    return {
      success: false,
      error: errorMessage,
      analysis: null,
    };
  }
}

// Helper function to extract text from different file types (for backend use)
export const extractTextFromFile = async (file: File | Buffer, filename: string): Promise<string> => {
  // This would need to be implemented based on your file processing needs
  // For now, assuming text files or that text extraction is handled elsewhere
  throw new Error('Text extraction not implemented - should be handled by backend file processing');
};

// Health check function for AI service
export const checkAIServiceHealth = async (): Promise<boolean> => {
  try {
    if (!apiKey) {
      console.error('[aiService] API key not configured');
      return false;
    }

    const model = client.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Test: respond with "OK"');
    const response = result.response?.text();
    
    console.log('[aiService] Health check response:', response);
    return response?.toLowerCase().includes('ok') || false;
    
  } catch (error) {
    console.error('[aiService] Health check failed:', error);
    return false;
  }
};

// Utility function to get user-friendly error messages
export const getErrorMessage = (error: unknown): { title: string; message: string; canRetry: boolean } => {
  if (error instanceof Error) {
    if (error.message.includes('API_KEY')) {
      return {
        title: 'Configuration Error',
        message: 'AI service API key is missing or invalid. Please check your configuration.',
        canRetry: false
      };
    }
    
    if (error.message.includes('quota')) {
      return {
        title: 'Service Limit Reached',
        message: 'AI service quota exceeded. Please try again later.',
        canRetry: true
      };
    }
    
    if (error.message.includes('safety')) {
      return {
        title: 'Content Blocked',
        message: 'Content was blocked by AI safety filters. Please try a different document.',
        canRetry: false
      };
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to AI service. Please check your internet connection.',
        canRetry: true
      };
    }

    return {
      title: 'Analysis Error',
      message: error.message,
      canRetry: true
    };
  }

  return {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again.',
    canRetry: true
  };
};
