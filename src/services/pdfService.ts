@@ -1,6 +1,6 @@
-import { pdfjsLib } from "pdfjs-dist";
+import * as pdfjsLib from "pdfjs-dist/build/pdf";
 import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
 import { GoogleGenerativeAI } from "@google/generative-ai";
 
 // Set the worker source to the correct path relative to the base URL
-pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/assets/pdf.worker.min.js`;
+pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;