@@ -1,13 +1,14 @@
 import * as pdfjsLib from 'pdfjs-dist';
 import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
 import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"; // Added safety settings imports
+import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';
 
 // --- PDF.js Worker Configuration ---
 // This line should be executed once, typically when your module is loaded.
 // It sets the path to the PDF.js worker script.
-// IMPORTANT: Ensure you have copied 'pdf.worker.min.js' from 'node_modules/pdfjs-dist/build/'
-// to your 'public/assets/' directory for this path to work.
 if (typeof window !== 'undefined' && window.document) { // Ensure this runs only in the browser
-  pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';
+  // Use Vite's URL import to get the correct path to the worker
+  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
 }
 // --- End PDF.js Worker Configuration ---
 
@@ -48,7 +49,7 @@
       if (!pdfjsLib.GlobalWorkerOptions.workerSrc && typeof window !== 'undefined') {
         // This is a fallback check, ideally workerSrc is set above globally.
         console.warn('PDF.js workerSrc was not set globally, attempting to set it now. This might indicate an issue if called late.');
-        // Attempt to set it again, though this might be too late if getDocument was already called.
-        // For Vite, ensure the top-level setting is effective.
-         pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js'; // Default path
+        // Use the imported worker URL as fallback
+        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
       }