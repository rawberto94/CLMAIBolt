import * as pdfjsLib from 'pdfjs-dist';
import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"; // Added safety settings imports

// --- PDF.js Worker Configuration ---
// This line should be executed once, typically when your module is loaded.
// It sets the path to the PDF.js worker script.
// IMPORTANT: Ensure you have copied 'pdf.worker.min.js' from 'node_modules/pdfjs-dist/build/'
// to your 'public/assets/' directory for this path to work.
if (typeof window !== 'undefined' && window.document) { // Ensure this runs only in the browser
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';
}
// --- End PDF.js Worker Configuration ---

// Azure Form Recognizer configuration
const formRecognizerEndpoint = import.meta.env.VITE_AZURE_FORM_RECOGNIZER_ENDPOINT || "";
const formRecognizerApiKey = import.meta.env.VITE_AZURE_FORM_RECOGNIZER_API_KEY || "";

// Google Gemini API configuration (ensure VITE_GEMINI_API_KEY is secure)
const googleApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

// Check if Azure Form Recognizer is configured
const isFormRecognizerConfigured = !!(formRecognizerEndpoint && formRecognizerApiKey);

// Check if Google API is configured
const isGoogleAiConfigured = !!googleApiKey;

/**
 * Validates the configuration for OCR services.
 * @returns Error message string if configuration is invalid, null if valid.
 */
function validateOcrConfiguration(): string | null {
  if (!isGoogleAiConfigured && !isFormRecognizerConfigured) {
    return 'OCR services are not configured. Please set up API keys for either Google Gemini or Azure Form Recognizer in your environment variables (e.g., VITE_GEMINI_API_KEY, VITE_AZURE_FORM_RECOGNIZER_ENDPOINT, VITE_AZURE_FORM_RECOGNIZER_API_KEY).';
  }
  return null;
}

/**
 * Extracts text content from a PDF file.
 * Tries PDF.js first, then falls back to OCR (Gemini, then Azure) if needed.
 * @param file The PDF file to extract text from.
 * @returns A promise that resolves to the extracted text string.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  if (file.type !== 'application/pdf') {
    throw new Error('Invalid file type. Please upload a PDF file.');
  }

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // Increased to 20MB for larger contracts
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024*1024)}MB limit. Please upload a smaller file.`);
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    let extractedTextViaPdfJs = "";
    let pdfJsFailed = false;

    // First, try to extract text using PDF.js
    try {
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc && typeof window !== 'undefined') {
        // This is a fallback check, ideally workerSrc is set above globally.
        console.warn('PDF.js workerSrc was not set globally, attempting to set it now. This might indicate an issue if called late.');
        // Attempt to set it again, though this might be too late if getDocument was already called.
        // For Vite, ensure the top-level setting is effective.
         pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js'; // Default path
      }
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc && typeof window !== 'undefined') {
         throw new Error('PDF.js worker not properly configured. `workerSrc` is missing.');
      }


      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer), // Using Uint8Array is often more robust
        disableRange: false, // Enable range requests for potentially better performance on large PDFs if served from HTTP
        disableStream: false, // Enable streaming for potentially better performance if served from HTTP
        disableAutoFetch: false,
        isEvalSupported: false, // Recommended to be false for security
        useSystemFonts: false, // Attempt to use embedded fonts for better accuracy
      });

      loadingTask.onPassword = (updatePassword:any, reason:any) => {
        // Handle password protected PDFs.
        // For now, we'll throw an error. In a real app, you might prompt the user.
        console.error('PDF Password Reason:', reason);
        const passwordError = new Error('Password protected PDFs are not supported.');
        // Attach a specific code or property if you need to catch this exact error type later
        (passwordError as any).code = 'PDF_PASSWORD_PROTECTED';
        throw passwordError;
      };

      const pdf = await loadingTask.promise;

      if (pdf.numPages === 0) {
        throw new Error('The PDF file appears to be empty (0 pages).');
      }

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent({
            normalizeWhitespace: true, // Helps with spacing issues
            disableCombineTextItems: false // Allows combining text items for better flow
        });
        // textContent.items can contain objects with 'str' (string) or 'R' (rich text)
        const pageText = textContent.items
            .map((item: any) => (item.str !== undefined ? item.str : (item.R && item.R.T) ? item.R.T : ''))
            .join(' '); // Join with space, consider line breaks based on item position if needed
        fullText += pageText + '\n\n'; // Add double newline between pages
      }
      extractedTextViaPdfJs = fullText.trim();

      // If PDF.js got meaningful text (e.g., more than a few characters per page on average)
      // The threshold of 100 characters is arbitrary; adjust based on typical short documents.
      if (extractedTextViaPdfJs.length > (pdf.numPages * 50)) { // Example: average 50 chars/page
        console.log("Successfully extracted text using PDF.js.");
        return extractedTextViaPdfJs;
      } else {
        console.log("PDF.js extracted minimal or no text. Length:", extractedTextViaPdfJs.length, ". Will attempt OCR.");
        // Don't set pdfJsFailed = true here, as it *did* process, just got little text.
        // The OCR fallback will occur naturally if this text is returned and deemed insufficient later.
      }

    } catch (pdfError: any) {
      console.error("PDF.js extraction failed:", pdfError);
      pdfJsFailed = true; // Mark that PDF.js itself failed
      if ((pdfError as any).code === 'PDF_PASSWORD_PROTECTED' || pdfError.message.includes('Password')) {
          throw pdfError; // Re-throw specific password error
      }
      // Other errors will lead to OCR fallback if configured.
    }

    // If PDF.js failed OR extracted very little text, proceed to OCR
    // Check OCR configuration before attempting any OCR service
    const ocrConfigError = validateOcrConfiguration();
    if (ocrConfigError) {
        if (pdfJsFailed || extractedTextViaPdfJs.length < 10) { // If PDF.js truly failed or got nothing
            throw new Error(ocrConfigError + " (And PDF.js extraction failed or yielded no text)");
        } else {
            // PDF.js worked but got minimal text, and no OCR is configured. Return what PDF.js got.
            console.warn("PDF.js extracted minimal text, and no OCR services are configured. Returning minimal text.");
            return extractedTextViaPdfJs;
        }
    }

    console.log("Attempting OCR...");
    // Try Google Gemini OCR first if configured
    if (isGoogleAiConfigured) {
      try {
        console.log("Using Google Gemini for OCR.");
        return await extractTextWithGeminiOCR(file);
      } catch (geminiError: any) {
        console.error("Gemini OCR failed:", geminiError.message);
        if (isFormRecognizerConfigured) {
          console.log("Gemini OCR failed. Falling back to Azure Form Recognizer.");
          // Fall through to Azure
        } else {
          throw new Error(`Gemini OCR failed: ${geminiError.message} No Azure fallback configured.`);
        }
      }
    }

    // Try Azure Form Recognizer if configured (or as fallback)
    if (isFormRecognizerConfigured) {
      try {
        console.log("Using Azure Form Recognizer for OCR.");
        return await extractTextWithAzureOCR(file);
      } catch (azureError: any) {
        console.error("Azure Form Recognizer OCR failed:", azureError.message);
        throw new Error(`Azure Form Recognizer OCR failed: ${azureError.message}`);
      }
    }
    
    // If we reach here, it means PDF.js yielded minimal text, and all configured OCR attempts failed or no OCR was configured.
    // If pdfJsFailed is true, it means the initial PDF.js attempt had an error.
    // If extractedTextViaPdfJs has content, it means PDF.js worked but text was minimal.
    if (pdfJsFailed) {
        throw new Error('PDF.js failed and no OCR service succeeded or was available.');
    } else if (extractedTextViaPdfJs) {
        console.warn("All OCR attempts failed or no OCR was sufficiently configured after PDF.js yielded minimal text. Returning minimal text from PDF.js.");
        return extractedTextViaPdfJs; // Return what little PDF.js got
    }

    // Should not be reached if logic is correct, but as a final fallback:
    throw new Error('Failed to extract text from PDF using all available methods.');

  } catch (error: any) {
    console.error('Overall error in extractTextFromPDF:', error.message);
    // Re-throw specific errors if they are informative, otherwise a generic one
    if (error.code === 'PDF_PASSWORD_PROTECTED' || error.message.includes('Password protected')) {
        throw new Error('Password protected PDFs are not supported.');
    }
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Converts a file to a base64 encoded string.
 * @param file The file to convert.
 * @returns A promise that resolves to the base64 string (including the data URI prefix).
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // This includes the "data:mime/type;base64," prefix
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64 string.'));
      }
    };
    reader.onerror = error => reject(new Error(`FileReader error: ${error}`));
  });
}

/**
 * Extracts text from a PDF using Gemini Vision for OCR capabilities.
 * @param file The PDF file to process.
 * @returns A promise that resolves to the extracted text.
 */
async function extractTextWithGeminiOCR(file: File): Promise<string> {
  if (!isGoogleAiConfigured) {
    throw new Error('Google Gemini API is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
  }

  const genAI = new GoogleGenerativeAI(googleApiKey);
  // Using gemini-1.5-flash as it supports multimodal input including PDF.
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest", // Use "gemini-1.5-flash-latest" or a specific version
     safetySettings: [ // Recommended to set safety settings
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
  });

  const base64DataWithPrefix = await fileToBase64(file);
  const base64Data = base64DataWithPrefix.substring(base64DataWithPrefix.indexOf(',') + 1); // Remove "data:mime/type;base64," prefix

  const prompt = "Extract all text content from this PDF document. Preserve the layout and structure as much as possible, including line breaks and paragraph separation. Do not add any commentary or summarization, only the extracted text.";

  try {
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType: file.type, data: base64Data } }
        ]
      }],
      // Generation config can be fine-tuned
      generationConfig: {
        temperature: 0.1, // Low temperature for more deterministic extraction
        maxOutputTokens: 8192, // Ensure sufficient tokens for long documents
      },
    });

    const response = result.response;
    const text = response.text();

    if (!text || text.trim() === "") {
      throw new Error("Gemini OCR returned empty text. The document might be image-only with no machine-readable text, or image quality is too low.");
    }
    console.log("Successfully extracted text using Gemini OCR.");
    return text;
  } catch (error: any) {
    console.error('Error in Gemini OCR processing:', error);
    if (error.message.includes('quota') || error.message.includes('billing')) {
        throw new Error('Gemini API quota or billing issue. Please check your Google Cloud project settings.');
    } else if (error.message.includes('API key')) {
        throw new Error('Invalid or missing Google API key for Gemini.');
    }
    throw new Error(`Gemini OCR processing failed: ${error.message}`);
  }
}

/**
 * Extracts text from a PDF (or other supported document type for Azure) using OCR via Azure Form Recognizer.
 * @param file The file to process.
 * @returns A promise that resolves to the extracted text.
 */
async function extractTextWithAzureOCR(file: File): Promise<string> {
  if (!isFormRecognizerConfigured) {
    throw new Error('Azure Form Recognizer is not configured. Please add VITE_AZURE_FORM_RECOGNIZER_ENDPOINT and VITE_AZURE_FORM_RECOGNIZER_API_KEY.');
  }

  const client = new DocumentAnalysisClient(formRecognizerEndpoint, new AzureKeyCredential(formRecognizerApiKey));
  const arrayBuffer = await file.arrayBuffer();
  // const fileBytes = new Uint8Array(arrayBuffer); // Not needed if beginAnalyzeDocument accepts ArrayBuffer

  try {
    // "prebuilt-layout" is often better for general text extraction preserving structure than "prebuilt-read"
    // "prebuilt-document" is more for key-value pairs, tables, and entities. For pure text + layout, layout is good.
    const poller = await client.beginAnalyzeDocument("prebuilt-layout", arrayBuffer, {
        // Optional: specify pages, locale, etc.
        // pages: "1-5", // Example: analyze only first 5 pages
        // locale: "en-US"
    });
    const { content, pages, tables } = await poller.pollUntilDone();

    if (!content && (!pages || pages.length === 0)) {
      throw new Error('Azure OCR processing completed but no text content was extracted. The document might be empty or unreadable.');
    }
    
    // The 'content' field often contains the full text in reading order.
    // If 'content' is well-structured, it might be preferable.
    // Otherwise, reconstruct from pages and lines for more control.
    let extractedText = "";
    if (content) {
        extractedText = content;
        console.log("Successfully extracted text using Azure Form Recognizer (from content field).");
    } else if (pages && pages.length > 0) {
        // Fallback to page/line iteration if 'content' is not sufficient
        for (const page of pages) {
            if (page.lines) {
                for (const line of page.lines) {
                    extractedText += line.content + '\n';
                }
            }
            extractedText += '\n'; // Page break
        }
        console.log("Successfully extracted text using Azure Form Recognizer (from pages/lines).");
    }


    // Optionally append formatted table data
    if (tables && tables.length > 0) {
      extractedText += '\n\n--- TABLES ---\n\n';
      for (const [tableIndex, table] of tables.entries()) {
        extractedText += `Table ${tableIndex + 1} (Rows: ${table.rowCount}, Columns: ${table.columnCount}):\n`;
        const tableMatrix: string[][] = Array(table.rowCount).fill(null).map(() => Array(table.columnCount).fill(''));
        for (const cell of table.cells) {
          if (cell.rowIndex < table.rowCount && cell.columnIndex < table.columnCount) {
            tableMatrix[cell.rowIndex][cell.columnIndex] = cell.content;
          }
        }
        for (const row of tableMatrix) {
          extractedText += row.join(' | ') + '\n';
        }
        extractedText += '\n';
      }
    }

    return extractedText.trim();
  } catch (error: any) {
    console.error('Error in Azure OCR processing:', error);
    if (error.statusCode === 401 || error.message.includes('Authentication') || error.message.includes('credential')) {
        throw new Error('Azure Form Recognizer authentication failed. Check endpoint/key.');
    }
    throw new Error(`Azure OCR processing failed: ${error.message}`);
  }
}

/**
 * Formats extracted text for better readability.
 * This is a basic formatter; can be expanded.
 * Note: This function is exported but not currently called within extractTextFromPDF.
 * The calling service can use it if needed.
 */
export function formatExtractedText(text: string): string {
  // 1. Normalize newlines: Replace CRLF and CR with LF
  let formattedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // 2. Replace multiple spaces/tabs with a single space, but preserve newlines
  formattedText = formattedText.split('\n').map(line => line.replace(/[ \t]+/g, ' ').trim()).join('\n');
  // 3. Consolidate multiple blank lines into a single blank line (max two newlines)
  formattedText = formattedText.replace(/\n{3,}/g, '\n\n');
  // 4. Trim leading/trailing whitespace from the whole text
  return formattedText.trim();
}
