import * as pdfjsLib from 'pdfjs-dist';
import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Buffer } from 'buffer';

// Set the worker source to the correct assets path
pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';

// Azure Form Recognizer configuration
const formRecognizerEndpoint = import.meta.env.VITE_AZURE_FORM_RECOGNIZER_ENDPOINT || "";
const formRecognizerKey = import.meta.env.VITE_AZURE_FORM_RECOGNIZER_KEY || "";
const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY || "";

// Initialize Azure Form Recognizer client
const client = new DocumentAnalysisClient(
  formRecognizerEndpoint,
  new AzureKeyCredential(formRecognizerKey)
);

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Extract only the base64 data after the "base64," prefix
        const base64 = reader.result.split('base64,')[1];
        if (!base64) reject(new Error('Failed to extract base64 data'));
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
  });
}

// Extract text from PDF using PDF.js
async function extractTextWithPdfJs(arrayBuffer: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText.trim();
}

// Extract text using Azure Form Recognizer
async function extractTextWithAzure(base64Data: string): Promise<string> {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const poller = await client.beginAnalyzeDocument(
      "prebuilt-document",
      buffer
    );
    const result = await poller.pollUntilDone();
    
    return result.content || '';
  } catch (error) {
    console.error('Azure Form Recognizer error:', error);
    throw error;
  }
}

// Main text extraction function that combines different approaches
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // First try PDF.js for direct text extraction
    const arrayBuffer = await file.arrayBuffer();
    let extractedText = await extractTextWithPdfJs(arrayBuffer);
    
    // If PDF.js extraction yields meaningful text, return it
    if (extractedText && extractedText.trim().length > 0) {
      return extractedText;
    }
    
    // If PDF.js fails to extract meaningful text, try Azure Form Recognizer
    console.log('Falling back to Azure Form Recognizer for OCR...');
    const base64Data = await fileToBase64(file);
    extractedText = await extractTextWithAzure(base64Data);
    
    if (extractedText && extractedText.trim().length > 0) {
      return extractedText;
    }
    
    throw new Error('Failed to extract text from PDF using available methods');
    
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'An unknown error occurred while extracting text from PDF'
    );
  }
}