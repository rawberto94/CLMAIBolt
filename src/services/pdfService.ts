// src/services/pdfService.ts
import * as pdfjsLib from "pdfjs-dist";

// Set the worker source to the correct path
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text from PDF using PDF.js (fast, free, client-side)
 * Good for text-based PDFs, won't work well with scanned documents
 */
export async function extractTextWithPDFJS(file: File): Promise<string> {
  try {
    console.log('[pdfService] Starting PDF.js text extraction...');
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    console.log(`[pdfService] PDF loaded: ${pdf.numPages} pages`);
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine all text items from the page
      const pageText = textContent.items
        .map((item: any) => {
          // Handle different text item types
          if (typeof item.str === 'string') {
            return item.str;
          }
          return '';
        })
        .filter(text => text.trim().length > 0) // Remove empty strings
        .join(' ');
      
      if (pageText.trim()) {
        fullText += `Page ${pageNum}:\n${pageText}\n\n`;
      }
      
      console.log(`[pdfService] Extracted ${pageText.length} characters from page ${pageNum}`);
    }
    
    const cleanedText = fullText.trim();
    
    if (cleanedText.length < 50) {
      throw new Error('PDF appears to contain very little readable text. It might be a scanned document or image-based PDF.');
    }
    
    console.log(`[pdfService] Successfully extracted ${cleanedText.length} characters total`);
    return cleanedText;
    
  } catch (error) {
    console.error('[pdfService] PDF.js extraction failed:', error);
    
    if (error instanceof Error) {
      // Provide more specific error messages
      if (error.message.includes('Invalid PDF')) {
        throw new Error('Invalid PDF file. The file may be corrupted.');
      } else if (error.message.includes('password')) {
        throw new Error('PDF is password protected. Please provide an unlocked version.');
      } else {
        throw new Error(`PDF extraction failed: ${error.message}`);
      }
    }
    
    throw new Error('Failed to extract text from PDF using PDF.js');
  }
}

/**
 * Quick check to see if PDF.js can handle this file
 */
export async function canPDFJSHandle(file: File): Promise<boolean> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Try to get the first page and see if there's readable text
    if (pdf.numPages > 0) {
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      const hasText = textContent.items.length > 0;
      
      console.log(`[pdfService] PDF compatibility check: ${hasText ? 'Compatible' : 'May need OCR'}`);
      return hasText;
    }
    
    return false;
  } catch (error) {
    console.log('[pdfService] PDF.js compatibility check failed:', error);
    return false;
  }
}
