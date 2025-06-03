import * as pdfjsLib from 'pdfjs-dist'; // Or "pdfjs-dist/build/pdf" is also fine

// Ensure this path correctly points to the worker file in your public directory
// This should be set once, early in your application.
if (typeof window !== 'undefined' && window.document) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';
}

// ... THEN your other imports like AzureKeyCredential, GoogleGenerativeAI, etc.
// ... AND THEN the rest of your feature-rich pdfService.ts code (the one with OCR fallbacks)import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source to the path of the worker file in your public/assets directory
// This line should be executed once, typically when your module is loaded.
if (typeof window !== 'undefined' && window.document) { // Ensure this runs only in the browser
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';
}

// ... rest of your imports (AzureKeyCredential, GoogleGenerativeAI, etc.)
// ... rest of your pdfService.ts codeimport * as pdfjsLib from 'pdfjs-dist';
// Import the ES Module worker for pdfjs-dist v4.x+
// The exact path might slightly change based on minor versions, ensure it's correct for your installed pdfjs-dist.
// For pdfjs-dist 4.10.38, 'pdf.worker.mjs' is the ESM worker.
import * as PdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs';

// Set the worker directly using the imported module
// This should be done ONCE, at the top level of your module or app initialization.
if (typeof window !== 'undefined' && window.document) { // Ensure this runs only in the browser
    pdfjsLib.GlobalWorkerOptions.workerSrc = PdfjsWorker;
}

// ... rest of your pdfService.ts code (AzureKeyCredential, GoogleGenerativeAI, etc.)import * as pdfjsLib from "pdfjs-dist/build/pdf";

// Set the worker source to the correct path relative to the base URL
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extracts text from a PDF file
 * @param file The PDF file to extract text from
 * @returns A promise that resolves to the extracted text
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Extract text from each page
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
