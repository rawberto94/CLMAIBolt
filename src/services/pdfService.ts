@@ -1,8 +1,8 @@
 import * as pdfjsLib from 'pdfjs-dist';
 import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
 import { GoogleGenerativeAI } from "@google/generative-ai";
-
-// Set the worker source to an absolute path in the public directory
-pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';
+
+// Set the worker source to the correct assets path
+pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';
 
 // Azure Form Recognizer configuration
 const formRecognizerEndpoint = import.meta.env.VITE_AZURE_FORM_RECOGNIZER_ENDPOINT || "";
@@ -147,7 +147,7 @@
     
     // Initialize Gemini
     const genAI = new GoogleGenerativeAI(googleApiKey);
-    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
+    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
 
     // Convert file to base64 for the prompt
     const base64Data = await fileToBase64(file);
@@ -220,7 +220,9 @@
     reader.readAsDataURL(file);
     reader.onload = () => {
       if (typeof reader.result === 'string') {
-        // Get the base64 data
-        const base64 = reader.result;
+        // Extract only the base64 data after the "base64," prefix
+        const base64 = reader.result.split('base64,')[1];
+        if (!base64) reject(new Error('Failed to extract base64 data'));
         resolve(base64);
       } else {
         reject(new Error('Failed to convert file to base64'));