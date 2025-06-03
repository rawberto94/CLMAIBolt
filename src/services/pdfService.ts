import * as pdfjsLib from "pdfjs-dist";
import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Set the worker source to the correct path relative to the base URL
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Optional Azure Form Recognizer client - only initialize if credentials are available
const azureEndpoint = import.meta.env.VITE_AZURE_FORM_RECOGNIZER_ENDPOINT;
const azureKey = import.meta.env.VITE_AZURE_FORM_RECOGNIZER_KEY;
let azureClient: DocumentAnalysisClient | null = null;

// Only initialize Azure client if both endpoint and key are available
if (azureEndpoint && azureKey) {
  try {
    azureClient = new DocumentAnalysisClient(
      azureEndpoint, 
      new AzureKeyCredential(azureKey)
    );
  } catch (error) {
    console.warn("Failed to initialize Azure Form Recognizer client:", error);
    azureClient = null;
  }
}

/**
 * Extracts text from a PDF file using PDF.js
 * Falls back to Azure Form Recognizer if PDF.js fails and Azure is configured
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    return await extractTextWithPdfJs(file);
  } catch (pdfJsError) {
    console.warn("PDF.js extraction failed:", pdfJsError);
    
    // Try Azure Form Recognizer as fallback if available
    if (azureClient) {
      try {
        return await extractTextWithAzure(file);
      } catch (azureError) {
        console.error("Azure Form Recognizer fallback failed:", azureError);
        throw new Error(`Failed to extract text from PDF: ${azureError instanceof Error ? azureError.message : 'Unknown error'}`);
      }
    } else {
      // If Azure is not configured, throw the original error
      throw new Error(`Failed to extract text from PDF: ${pdfJsError instanceof Error ? pdfJsError.message : 'Unknown error'}`);
    }
  }
}

/**
 * Extract text from PDF using PDF.js
 */
async function extractTextWithPdfJs(file: File): Promise<string> {
  // Convert file to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  
  // Load the PDF document
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  
  // Iterate through each page
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    
    fullText += pageText + '\n\n';
  }
  
  return fullText.trim();
}

/**
 * Extract text from PDF using Azure Form Recognizer
 */
async function extractTextWithAzure(file: File): Promise<string> {
  if (!azureClient) {
    throw new Error("Azure Form Recognizer not configured");
  }
  
  // Convert file to Uint8Array
  const arrayBuffer = await file.arrayBuffer();
  const fileBytes = new Uint8Array(arrayBuffer);
  
  // Analyze the document
  const poller = await azureClient.beginAnalyzeDocument("prebuilt-document", fileBytes);
  const result = await poller.pollUntilDone();
  
  if (!result.content) {
    throw new Error("No content extracted by Azure Form Recognizer");
  }
  
  return result.content;
}