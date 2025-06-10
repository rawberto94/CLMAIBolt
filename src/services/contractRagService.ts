// src/services/contractRagService.ts

import { AnalysisResult, AnalysisProgress } from '../types';

type ProgressCallback = (progress: AnalysisProgress) => void;

// The URL of your new backend server
const BACKEND_API_URL = 'http://localhost:4000/api/analyze';

export const handleAnalysisRequest = async (
    file: File,
    taxonomy: string, // Taxonomy can still be passed if needed by the prompt
    onProgress: ProgressCallback
): Promise<AnalysisResult> => {

    console.log("Frontend service: Starting analysis request...");
    onProgress({ status: 'uploading', percentage: 10 });

    // 1. Prepare the file for upload
    const formData = new FormData();
    formData.append('file', file);
    // You can add more data to the form if your backend needs it
    // formData.append('taxonomy', taxonomy);

    try {
        // 2. Make the real API call to the backend
        console.log(`Sending file to backend at ${BACKEND_API_URL}`);
        onProgress({ status: 'processing_on_server', percentage: 40 });

        const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            body: formData,
        });

        // 3. Handle the response from the backend
        if (!response.ok) {
            // If the server responded with an error (e.g., 400 or 500)
            const errorData = await response.json();
            throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }

        console.log("Received successful analysis from backend.");
        onProgress({ status: 'finalizing', percentage: 90 });

        // The backend should return JSON that matches the AnalysisResult type
        const analysisResult: AnalysisResult = await response.json();
        
        onProgress({ status: 'complete', percentage: 100 });
        return analysisResult;

    } catch (error) {
        console.error("Error during analysis request:", error);
        onProgress({ status: 'error', percentage: 100 });
        // Re-throw the error so the UI component can catch it and display a message
        throw error;
    }
};

export const initializeContractRAG = async () => {
    // This function can be used to ping the backend to see if it's alive
    console.log("Initializing frontend service and checking backend connection...");
    // You could add a fetch call to a simple '/api/health' endpoint on your server here
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Frontend service ready.");
    return true;
};
