import * as pdfjsLib from 'pdfjs-dist';
import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Set the worker source to an absolute path in the public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';

// Azure Form Recognizer configuration
const formRecognizerEndpoint = import.meta.env.VITE_AZURE_FORM_RECOGNIZER_ENDPOINT || "";
const formRecognizerApiKey = import.meta.env.VITE_AZURE_FORM_RECOGNIZER_API_KEY || "";

// Google Document AI configuration
const googleApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

// Check if Azure Form Recognizer is configured
const isFormRecognizerConfigured = formRecognizerEndpoint && formRecognizerApiKey;

// Check if Google API is configured
const isGoogleAiConfigured = !!googleApiKey;

/**
 * Validates the configuration for OCR services
 * @returns Error message if configuration is invalid, null if valid
 */
function validateOcrConfiguration(): string | null {
  if (!isGoogleAiConfigured && !isFormRecognizerConfigured) {
    return 'OCR services are not configured. Please set up either Google Gemini or Azure Form Recognizer.';
  }
  return null;
}

/**
 * Extracts text content from a PDF file
 * @param file The PDF file to extract text from
 * @returns A promise that resolves to the extracted text
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  // Validate file type
  if (file.type !== 'application/pdf') {
    throw new Error('Invalid file type. Please upload a PDF file.');
  }

  // Check file size (max 10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit. Please upload a smaller file.');
  }

  try {
    // Convert the File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // First try to extract text using PDF.js
    try {
      // Verify PDF.js worker is loaded
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        throw new Error('PDF.js worker not properly configured.');
      }

      // Load the PDF document with additional error handling and configuration
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        disableRange: true,
        disableStream: true,
        disableAutoFetch: true,
        isEvalSupported: false,
        useSystemFonts: true
      });
      
      // Add error handler for password protected PDFs
      loadingTask.onPassword = () => {
        throw new Error('Password protected PDFs are not supported.');
      };

      const pdf = await loadingTask.promise.catch(error => {
        console.error('PDF.js loading error:', error);
        if (error.message.includes('Password')) {
          throw new Error('Password protected PDFs are not supported.');
        } else if (error.message.includes('Invalid PDF structure')) {
          throw new Error('The PDF file appears to be corrupted. Please verify the file integrity.');
        } else if (error.message.includes('worker')) {
          throw new Error('PDF processing system failed to initialize. Please refresh the page and try again.');
        }
        throw new Error('Failed to load PDF. Please ensure the file is not corrupted.');
      });
      
      // Get the total number of pages
      const numPages = pdf.numPages;
      
      if (numPages === 0) {
        throw new Error('The PDF file appears to be empty.');
      }
      
      // Extract text from all pages
      let fullText = '';
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => 'str' in item ? item.str : '')
          .join(' ');
        fullText += pageText + '\n\n';
      }
      
      // If we got meaningful text, return it
      if (fullText.trim() && fullText.trim().length > 100) {
        return fullText;
      }
      
      // If text is too short or empty, try OCR
      console.log("PDF.js extracted minimal text, trying OCR...");
      
      // Check OCR configuration before proceeding
      const configError = validateOcrConfiguration();
      if (configError) {
        throw new Error(configError);
      }
    } catch (pdfError) {
      console.error("PDF.js extraction failed:", pdfError);
      // Check OCR configuration before proceeding
      const configError = validateOcrConfiguration();
      if (configError) {
        throw new Error(configError);
      }
    }
    
    // Try Google Gemini OCR first if configured
    if (isGoogleAiConfigured) {
      try {
        console.log("Using Google Document AI for OCR");
        return await extractTextWithGeminiOCR(file);
      } catch (geminiError) {
        console.error("Gemini OCR failed:", geminiError);
        // If Gemini fails and Azure is configured, try Azure
        if (isFormRecognizerConfigured) {
          console.log("Falling back to Azure Form Recognizer");
          return await extractTextWithOCR(file);
        }
        throw geminiError;
      }
    } 
    // Try Azure Form Recognizer if configured
    else if (isFormRecognizerConfigured) {
      console.log("Using Azure Form Recognizer for OCR");
      return await extractTextWithOCR(file);
    } 
    
    throw new Error('No OCR service is available. Please configure either Google Gemini or Azure Form Recognizer.');
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    
    if (error instanceof Error) {
      // Handle specific error cases
      if (error.message.includes('worker')) {
        throw new Error('PDF processing system failed to initialize. Please refresh the page and try again.');
      } else if (error.message.includes('Password')) {
        throw new Error('Password protected PDFs are not supported.');
      } else if (error.message.includes('API key')) {
        throw new Error('OCR service authentication failed. Please check your API key configuration.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error occurred. Please check your internet connection and try again.');
      }
      
      // Pass through our custom error messages
      throw error;
    }
    
    throw new Error('Failed to extract text from PDF. Please ensure it\'s a valid PDF file and try again.');
  }
}

/**
 * Extracts text from a PDF using Gemini for OCR capabilities
 * @param file The PDF file to process
 * @returns A promise that resolves to the extracted text
 */
async function extractTextWithGeminiOCR(file: File): Promise<string> {
  try {
    if (!isGoogleAiConfigured) {
      throw new Error('Google API is not configured. Please add API key to your environment variables.');
    }
    
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(googleApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert file to base64 for the prompt
    const base64Data = await fileToBase64(file);
    const filePreview = base64Data.substring(0, 100); // Just for logging
    console.log("File preview for OCR:", filePreview);

    // Create a prompt asking Gemini to extract text from the PDF
    const prompt = `
This is a document that needs text extraction. Please extract all the text content from this image.
The document might contain paragraphs, tables, headers, and other text elements.
Please output ONLY the extracted text, formatted as closely as possible to the original document structure.
Do not include any analysis or commentary about the document.
`;

    // Generate content with the model
    const result = await model.generateContent({
      contents: [{ 
        role: "user",
        parts: [{ text: prompt }, { inlineData: { mimeType: "application/pdf", data: base64Data } }]
      }],
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });

    const response = result.response;
    const text = response.text();
    
    if (!text || text.trim() === "") {
      throw new Error("Gemini Vision returned empty text. The document might not contain readable text or the image quality is too low.");
    }
    
    return text;
  } catch (error) {
    console.error('Error in Gemini OCR processing:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Google API authentication failed. Please check your API key.');
      } else if (error.message.includes('network') || error.message.includes('connection') || error.message.includes('CORS')) {
        throw new Error('Network error during OCR processing. This may be due to CORS restrictions in the browser environment.');
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        throw new Error('Google API quota exceeded. Please try again later.');
      } else if (error.message.includes('model') || error.message.includes('not available')) {
        throw new Error('The specified AI model is not available. Please try a different model.');
      }
    }
    
    throw new Error('Gemini Vision processing failed. Please try again or use a different document.');
  }
}

/**
 * Converts a file to base64 encoding
 * @param file The file to convert
 * @returns A promise that resolves to the base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Get the base64 data
        const base64 = reader.result;
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Extracts text from a PDF using OCR via Azure Form Recognizer
 * @param file The PDF file to process
 * @returns A promise that resolves to the extracted text
 */
async function extractTextWithOCR(file: File): Promise<string> {
  try {
    if (!isFormRecognizerConfigured) {
      throw new Error('Azure Form Recognizer is not configured. Please add endpoint and API key to your environment variables.');
    }
    
    // Create a client for Azure Form Recognizer
    const client = new DocumentAnalysisClient(
      formRecognizerEndpoint,
      new AzureKeyCredential(formRecognizerApiKey)
    );
    
    // Convert file to Uint8Array for Azure API
    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);
    
    // Start the analysis operation
    const poller = await client.beginAnalyzeDocument("prebuilt-document", fileBytes);
    
    // Wait for the operation to complete
    const result = await poller.pollUntilDone();
    
    // Extract text from the result
    let extractedText = '';
    
    if (result.pages && result.pages.length > 0) {
      // Process each page
      for (const page of result.pages) {
        // Process each line on the page
        if (page.lines) {
          for (const line of page.lines) {
            extractedText += line.content + '\n';
          }
          extractedText += '\n'; // Add extra newline between pages
        }
      }
    }
    
    // Process tables if present
    if (result.tables && result.tables.length > 0) {
      extractedText += '\n\nTABLES:\n\n';
      
      for (const [tableIndex, table] of result.tables.entries()) {
        extractedText += `Table ${tableIndex + 1}:\n`;
        
        // Create a matrix to represent the table
        const tableMatrix: string[][] = [];
        
        // Initialize the matrix with empty strings
        for (let i = 0; i < table.rowCount; i++) {
          tableMatrix.push(Array(table.columnCount).fill(''));
        }
        
        // Fill in the matrix with cell values
        if (table.cells) {
          for (const cell of table.cells) {
            if (cell.rowIndex !== undefined && cell.columnIndex !== undefined) {
              tableMatrix[cell.rowIndex][cell.columnIndex] = cell.content || '';
            }
          }
        }
        
        // Convert the matrix to a string representation
        for (const row of tableMatrix) {
          extractedText += row.join(' | ') + '\n';
        }
        
        extractedText += '\n';
      }
    }
    
    if (!extractedText.trim()) {
      throw new Error('OCR processing completed but no text was extracted. The document might be empty or contain only images without text.');
    }
    
    return extractedText;
  } catch (error) {
    console.error('Error in OCR processing:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('authentication') || error.message.includes('credential')) {
        throw new Error('Azure Form Recognizer authentication failed. Please check your API key and endpoint.');
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        throw new Error('Network error during OCR processing. Please check your internet connection.');
      }
    }
    
    throw new Error('OCR processing failed. Please try again or use a different document.');
  }
}

/**
 * Formats extracted text for better readability
 * This can be expanded to handle specific formatting needs
 */
export function formatExtractedText(text: string): string {
  // Remove excessive whitespace
  let formattedText = text.replace(/\s+/g, ' ');
  
  // Restore paragraph breaks (often indicated by double newlines)
  formattedText = formattedText.replace(/\.\s+/g, '.\n\n');
  
  return formattedText.trim();
}