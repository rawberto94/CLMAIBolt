import * as pdfjsLib from 'pdfjs-dist';
import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import { GoogleGenerativeAI } from "@google/generative-ai";

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