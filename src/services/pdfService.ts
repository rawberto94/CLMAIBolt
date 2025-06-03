import { pdfjsLib } from "pdfjs-dist";
import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Set the worker source to the correct path relative to the base URL
pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/assets/pdf.worker.min.js`;

// Azure Form Recognizer configuration
const formRecognizerEndpoint = import.meta.env.VITE_AZURE_FORM_RECOGNIZER_ENDPOINT || "";
const formRecognizerKey = import.meta.env.VITE_AZURE_FORM_RECOGNIZER_KEY || "";