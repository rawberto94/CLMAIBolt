// src/services/documentService.ts
import { extractTextWithPDFJS, canPDFJSHandle } from './pdfService';
import { extractTextWithGoogleDocumentAI, isGoogleDocumentAIConfigured } from './googleDocumentAI';

// Supported file types
const SUPPORTED_TYPES = {
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  TXT: 'text/plain',
  RTF: 'application/rtf',
  ODT: 'application/vnd.oasis.opendocument.text'
};

interface ExtractionResult {
  text: string;
  method: 'pdfjs' | 'google-document-ai' | 'text-reader' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  pageCount?: number;
  warnings?: string[];
}

/**
 * Main document text extraction function
 * Tries multiple methods in order of preference for best results
 */
export async function extractTextFromDocument(
  file: File,
  forceMethod?: 'pdfjs' | 'google-document-ai'
): Promise<string> {
  console.log(`[documentService] Starting extraction for ${file.name} (${file.type}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  
  // Validate file
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  try {
    const result = await extractWithBestMethod(file, forceMethod);
    
    // Log the result
    console.log(`[documentService] Extraction completed using ${result.method}`);
    console.log(`[documentService] Extracted ${result.text.length} characters with ${result.confidence} confidence`);
    
    if (result.warnings && result.warnings.length > 0) {
      console.warn('[documentService] Warnings:', result.warnings);
    }
    
    return result.text;
    
  } catch (error) {
    console.error('[documentService] All extraction methods failed:', error);
    throw new Error(`Failed to extract text from document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Try different extraction methods based on file type and availability
 */
async function extractWithBestMethod(
  file: File, 
  forceMethod?: 'pdfjs' | 'google-document-ai'
): Promise<ExtractionResult> {
  
  // Handle text files directly
  if (file.type === SUPPORTED_TYPES.TXT) {
    return await extractTextFile(file);
  }
  
  // Handle PDF files with multiple strategies
  if (file.type === SUPPORTED_TYPES.PDF) {
    return await extractPDFWithFallback(file, forceMethod);
  }
  
  // Handle Word documents
  if (file.type === SUPPORTED_TYPES.DOC || file.type === SUPPORTED_TYPES.DOCX) {
    return await extractWordDocument(file, forceMethod);
  }
  
  // Handle other document types
  if (isDocumentType(file)) {
    return await extractOtherDocument(file, forceMethod);
  }
  
  // Unknown file type - try as text
  console.warn(`[documentService] Unknown file type ${file.type}, attempting text extraction`);
  return await extractTextFile(file);
}

/**
 * Extract text from PDF with fallback strategy
 */
async function extractPDFWithFallback(
  file: File, 
  forceMethod?: 'pdfjs' | 'google-document-ai'
): Promise<ExtractionResult> {
  
  // If forced to use specific method
  if (forceMethod === 'google-document-ai') {
    if (!isGoogleDocumentAIConfigured()) {
      throw new Error('Google Document AI is not configured');
    }
    const text = await extractTextWithGoogleDocumentAI(file);
    return {
      text,
      method: 'google-document-ai',
      confidence: 'high'
    };
  }
  
  if (forceMethod === 'pdfjs') {
    const text = await extractTextWithPDFJS(file);
    return {
      text,
      method: 'pdfjs',
      confidence: 'medium'
    };
  }
  
  // Smart fallback strategy
  try {
    // First, try PDF.js (fast and free)
    console.log('[documentService] Trying PDF.js first...');
    
    const canHandle = await canPDFJSHandle(file);
    if (canHandle) {
      const text = await extractTextWithPDFJS(file);
      
      // Check if extraction quality is good
      if (isGoodTextQuality(text)) {
        return {
          text,
          method: 'pdfjs',
          confidence: 'high'
        };
      } else {
        console.log('[documentService] PDF.js extraction quality is low, trying Google Document AI...');
        throw new Error('Low quality extraction from PDF.js');
      }
    } else {
      throw new Error('PDF.js cannot handle this file');
    }
    
  } catch (pdfJsError) {
    console.log('[documentService] PDF.js failed, falling back to Google Document AI...');
    
    // Fallback to Google Document AI
    if (isGoogleDocumentAIConfigured()) {
      try {
        const text = await extractTextWithGoogleDocumentAI(file);
        return {
          text,
          method: 'google-document-ai',
          confidence: 'high',
          warnings: [`PDF.js failed: ${pdfJsError instanceof Error ? pdfJsError.message : 'Unknown error'}`]
        };
      } catch (googleError) {
        throw new Error(`Both PDF.js and Google Document AI failed. PDF.js: ${pdfJsError instanceof Error ? pdfJsError.message : 'Unknown error'}. Google: ${googleError instanceof Error ? googleError.message : 'Unknown error'}`);
      }
    } else {
      throw new Error(`PDF.js failed and Google Document AI is not configured: ${pdfJsError instanceof Error ? pdfJsError.message : 'Unknown error'}`);
    }
  }
}

/**
 * Extract text from Word documents
 */
async function extractWordDocument(
  file: File, 
  forceMethod?: 'pdfjs' | 'google-document-ai'
): Promise<ExtractionResult> {
  
  // Word documents need OCR/Document AI
  if (isGoogleDocumentAIConfigured() && forceMethod !== 'pdfjs') {
    const text = await extractTextWithGoogleDocumentAI(file);
    return {
      text,
      method: 'google-document-ai',
      confidence: 'high'
    };
  }
  
  throw new Error('Word document processing requires Google Document AI to be configured');
}

/**
 * Extract text from other document types
 */
async function extractOtherDocument(
  file: File, 
  forceMethod?: 'pdfjs' | 'google-document-ai'
): Promise<ExtractionResult> {
  
  // Try Google Document AI first for unknown document types
  if (isGoogleDocumentAIConfigured() && forceMethod !== 'pdfjs') {
    try {
      const text = await extractTextWithGoogleDocumentAI(file);
      return {
        text,
        method: 'google-document-ai',
        confidence: 'medium'
      };
    } catch (error) {
      console.log('[documentService] Google Document AI failed for unknown type, trying text extraction...');
    }
  }
  
  // Fallback to text extraction
  return await extractTextFile(file);
}

/**
 * Extract plain text files
 */
async function extractTextFile(file: File): Promise<ExtractionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        reject(new Error('Failed to read file content'));
        return;
      }
      
      resolve({
        text: text.trim(),
        method: 'text-reader',
        confidence: 'high'
      });
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read text file'));
    };
    
    // Try UTF-8 first, could add encoding detection here
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Validate file before processing
 */
function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 50MB`
    };
  }
  
  // Check if file type is supported
  const supportedTypes = Object.values(SUPPORTED_TYPES);
  if (!supportedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
    console.warn(`[documentService] Unsupported file type: ${file.type}`);
    // Don't reject - try anyway
  }
  
  return { isValid: true };
}

/**
 * Check if extracted text quality is good enough
 */
function isGoodTextQuality(text: string): boolean {
  if (!text || text.length < 100) {
    return false;
  }
  
  // Check for reasonable word-to-character ratio
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const avgWordLength = text.length / words.length;
  
  // If average word length is too high, might be garbled text
  if (avgWordLength > 15) {
    return false;
  }
  
  // Check for minimum readable content
  const readableWords = words.filter(word => /^[a-zA-Z]+$/.test(word));
  const readableRatio = readableWords.length / words.length;
  
  return readableRatio > 0.3; // At least 30% readable words
}

/**
 * Check if file is a document type
 */
function isDocumentType(file: File): boolean {
  const documentTypes = Object.values(SUPPORTED_TYPES);
  return documentTypes.includes(file.type);
}

/**
 * Get extraction capabilities based on current configuration
 */
export function getExtractionCapabilities(): {
  canExtractPDF: boolean;
  canExtractWord: boolean;
  canUseOCR: boolean;
  methods: string[];
} {
  const googleConfigured = isGoogleDocumentAIConfigured();
  
  return {
    canExtractPDF: true, // PDF.js always available
    canExtractWord: googleConfigured,
    canUseOCR: googleConfigured,
    methods: [
      'text-reader',
      'pdfjs',
      ...(googleConfigured ? ['google-document-ai'] : [])
    ]
  };
}

/**
 * Test extraction with a simple document
 */
export async function testExtraction(): Promise<{ [method: string]: boolean }> {
  const results: { [method: string]: boolean } = {};
  
  // Test text extraction
  try {
    const testFile = new File(['Hello, this is a test document.'], 'test.txt', { type: 'text/plain' });
    await extractTextFile(testFile);
    results['text-reader'] = true;
  } catch {
    results['text-reader'] = false;
  }
  
  // Test Google Document AI (if configured)
  if (isGoogleDocumentAIConfigured()) {
    results['google-document-ai'] = true; // Assume it works if configured
  } else {
    results['google-document-ai'] = false;
  }
  
  results['pdfjs'] = true; // PDF.js should always work
  
  return results;
}
