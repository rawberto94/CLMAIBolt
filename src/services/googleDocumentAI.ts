// src/services/googleDocumentAI.ts
import { GoogleAuth } from 'google-auth-library';

// Configuration - add these to your .env file
// Read environment variables with fallbacks
const PROJECT_ID = import.meta.env.VITE_GOOGLE_PROJECT_ID || '';
const LOCATION = import.meta.env.VITE_GOOGLE_DOCUMENT_AI_LOCATION || 'us'; // us, eu, asia
const PROCESSOR_ID = import.meta.env.VITE_GOOGLE_DOCUMENT_AI_PROCESSOR_ID || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

// Document AI endpoint
const DOCUMENT_AI_ENDPOINT = `https://${LOCATION}-documentai.googleapis.com`;

interface DocumentAIResponse {
  document: {
    text: string;
    pages: Array<{
      pageNumber: number;
      paragraphs?: Array<{
        layout: {
          textAnchor: {
            textSegments: Array<{
              startIndex: string;
              endIndex: string;
            }>;
          };
        };
      }>;
    }>;
    entities?: Array<{
      type: string;
      mentionText: string;
      confidence: number;
    }>;
  };
}

/**
 * Extract text from document using Google Document AI
 * Excellent for scanned documents, complex layouts, and OCR
 */
export async function extractTextWithGoogleDocumentAI(file: File): Promise<string> {
  try {
    // Check if Document AI is configured
    if (!isGoogleDocumentAIConfigured()) {
      return mockExtractTextFromDocument(file);
    }
    
    console.log('[googleDocumentAI] Starting Document AI extraction...');
    
    // Validate configuration
    if (!PROJECT_ID || !PROCESSOR_ID) {
      throw new Error('Google Document AI not configured. Please check PROJECT_ID and PROCESSOR_ID in environment variables.');
    }
    
    // Convert file to base64
    const fileBytes = await fileToBase64(file);
    
    // Prepare the request
    const requestBody = {
      rawDocument: {
        content: fileBytes,
        mimeType: file.type || 'application/pdf'
      },
      fieldMask: {
        paths: ['text', 'pages', 'entities']
      }
    };
    
    // Construct the API URL
    const url = `${DOCUMENT_AI_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}:process`;
    
    console.log('[googleDocumentAI] Sending request to Document AI...');

    // Headers with API key authentication
    const headers = {
      'Content-Type': 'application/json'
    };

    // Add API key if available
    if (API_KEY) {
      headers['X-Goog-Api-Key'] = API_KEY;
    }

    // Make the API request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[googleDocumentAI] API Error:', errorData);
      
      if (response.status === 401) {
        throw new Error('Google Document AI authentication failed. Please check your credentials.');
      } else if (response.status === 403) {
        throw new Error('Google Document AI access denied. Please check your API permissions.');
      } else if (response.status === 429) {
        throw new Error('Google Document AI rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Google Document AI API error: ${response.status} ${response.statusText}`);
      }
    }
    
    const result: DocumentAIResponse = await response.json();
    
    // Extract the text
    const extractedText = result.document?.text || '';
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text found in document. The document might be empty or contain only images.');
    }
    
    console.log(`[googleDocumentAI] Successfully extracted ${extractedText.length} characters`);
    
    // Optional: Log entities found (useful for debugging)
    if (result.document?.entities) {
      const entities = result.document.entities
        .filter(entity => entity.confidence > 0.8)
        .map(entity => `${entity.type}: ${entity.mentionText}`)
        .slice(0, 5); // Just first 5 high-confidence entities
      
      if (entities.length > 0) {
        console.log('[googleDocumentAI] High-confidence entities found:', entities);
      }
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('[googleDocumentAI] Document AI extraction failed:', error);
    
    if (error instanceof Error) {
      throw error; // Re-throw our custom errors
    }
    
    throw new Error('Failed to extract text using Google Document AI');
  }
}

/**
 * Convert file to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to convert file to base64'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get access token for Google API
 */
async function getAccessToken(): Promise<string> {
  // Since we're using API keys, we don't need this function anymore
  // But we keep it for compatibility with any existing code
  if (API_KEY) {
    // If using API key, return empty string (key is in header)
    return '';
  }
  return '';
}

/**
 * Check if Google Document AI is properly configured
 */
export function isGoogleDocumentAIConfigured(): boolean {
  const hasConfig = Boolean(
    PROJECT_ID && 
    PROCESSOR_ID && 
    API_KEY
  );
  
  console.log('[googleDocumentAI] Google Document AI configuration status:', hasConfig);
  return hasConfig;
}

/**
 * Mock function to simulate document text extraction
 */
async function mockExtractTextFromDocument(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(`Document: ${file.name || 'unnamed'}
      
This is placeholder text because Google Document AI is not configured. 
The actual document could not be processed using standard methods, suggesting it might be:

1. A scanned document (image-based PDF)
2. A PDF with security restrictions
3. A PDF with complex layout that requires OCR

To analyze this document properly, please:
- Configure Google Document AI credentials in your environment variables
- Try a different document format with selectable text
- Convert scanned documents to text using an OCR tool first`);
    };
    
    reader.readAsArrayBuffer(file.slice(0, 100)); // Just read the beginning to get metadata
  });
}

/**
 * Get configuration status for debugging
 */
export function getConfigurationStatus(): { [key: string]: boolean } {
  return {
    projectId: Boolean(PROJECT_ID),
    processorId: Boolean(PROCESSOR_ID),
    apiKey: Boolean(API_KEY),
    location: Boolean(LOCATION)
  };
}
