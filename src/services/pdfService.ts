import { pdfjsLib } from "pdfjs-dist";
import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Set the worker source to the correct path relative to the base URL
pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/assets/pdf.worker.min.js`;

// Azure Form Recognizer configuration
const formRecognizerEndpoint = import.meta.env.VITE_AZURE_FORM_RECOGNIZER_ENDPOINT || "";
const formRecognizerKey = import.meta.env.VITE_AZURE_FORM_RECOGNIZER_KEY || "";

/**
 * Extracts text content from a PDF file
 * @param file The PDF file to extract text from
 * @returns A promise that resolves to the extracted text
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Read the file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Extract text from all pages
    const maxPages = pdf.numPages;
    const pageTextPromises = [];
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      pageTextPromises.push(pageText);
    }
    
    // Combine text from all pages
    const fullText = (await Promise.all(pageTextPromises)).join('\n\n');
    return fullText;
    
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}