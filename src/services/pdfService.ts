import * as pdfjsLib from 'pdfjs-dist';
import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.js?url';

// --- PDF.js Worker Configuration ---
// This line should be executed once, typically when your module is loaded.
// It sets the path to the PDF.js worker script.
if (typeof window !== 'undefined' && window.document) { // Ensure this runs only in the browser
  // Use Vite's URL import to get the correct path to the worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}
// --- End PDF.js Worker Configuration ---

// --- Azure Form Recognizer Configuration ---
const endpoint = import.meta.env.VITE_AZURE_ENDPOINT;
const key = import.meta.env.VITE_AZURE_KEY;
const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));

// --- Gemini Configuration ---
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Configure safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    // Additional safety check for worker configuration
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc && typeof window !== 'undefined') {
      // This is a fallback check, ideally workerSrc is set above globally.
      console.warn('PDF.js workerSrc was not set globally, attempting to set it now. This might indicate an issue if called late.');
      // Use the imported worker URL as fallback
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    }
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document using PDF.js
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Iterate through each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    
    try {
      // Fallback to Azure Form Recognizer
      const poller = await client.beginAnalyzeDocument(
        "prebuilt-document",
        await file.arrayBuffer()
      );
      
      const result = await poller.pollUntilDone();
      
      if (result.content) {
        return result.content;
      }
    } catch (azureError) {
      console.error('Azure Form Recognizer fallback failed:', azureError);
      throw new Error('Failed to extract text from PDF');
    }
    throw error;
  }
}