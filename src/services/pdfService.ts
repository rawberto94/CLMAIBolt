import * as pdfjsLib from 'pdfjs-dist';
import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';

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