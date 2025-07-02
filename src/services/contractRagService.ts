// src/services/contractRagService.ts
import { AnalysisResult, AnalysisProgress } from '../types';

type ProgressCallback = (progress: AnalysisProgress) => void;

// Configuration
const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000/api';
const ANALYZE_ENDPOINT = `${BACKEND_API_URL}/analyze`;
const HEALTH_ENDPOINT = `${BACKEND_API_URL}/health`;

// Timeout configurations
const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds
const ANALYSIS_TIMEOUT = 300000; // 5 minutes
const MAX_RETRIES = 3;

interface BackendError {
    error: string;
    details?: string;
    code?: string;
}

class ContractAnalysisError extends Error {
    public code?: string;
    public details?: string;
    
    constructor(message: string, code?: string, details?: string) {
        super(message);
        this.name = 'ContractAnalysisError';
        this.code = code;
        this.details = details;
    }
}

// Utility function to create fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new ContractAnalysisError(
                `Request timed out after ${timeout / 1000} seconds`,
                'TIMEOUT',
                'The analysis request took too long to complete. Please try again or contact support.'
            );
        }
        throw error;
    }
};

// Health check function
export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        console.log(`Checking backend health at ${HEALTH_ENDPOINT}`);
        
        const response = await fetchWithTimeout(HEALTH_ENDPOINT, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }, HEALTH_CHECK_TIMEOUT);

        if (response.ok) {
            const healthData = await response.json();
            console.log('Backend health check passed:', healthData);
            return true;
        } else {
            console.warn(`Backend health check failed with status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error('Backend health check failed:', error);
        return false;
    }
};

// Enhanced initialization with real backend check
export const initializeContractRAG = async (): Promise<boolean> => {
    console.log("Initializing Contract RAG service...");
    
    try {
        // Check if backend is available
        const isHealthy = await checkBackendHealth();
        
        if (!isHealthy) {
            throw new ContractAnalysisError(
                'Backend service is not available',
                'BACKEND_UNAVAILABLE',
                'The analysis server is currently down or unreachable. Please try again later.'
            );
        }

        console.log("Contract RAG service initialized successfully");
        return true;
        
    } catch (error) {
        console.error("Failed to initialize Contract RAG service:", error);
        throw error;
    }
};

// Enhanced analysis request with better error handling and progress
export const handleAnalysisRequest = async (
    file: File,
    taxonomy: string = 'standard',
    onProgress: ProgressCallback
): Promise<AnalysisResult> => {
    console.log("Starting contract analysis request...");
    
    // Validate file
    if (!file) {
        throw new ContractAnalysisError('No file provided', 'INVALID_FILE');
    }

    // Check file size (e.g., max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        throw new ContractAnalysisError(
            'File size too large', 
            'FILE_TOO_LARGE',
            `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 50MB.`
        );
    }

    // Check file type
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        throw new ContractAnalysisError(
            'Unsupported file type',
            'INVALID_FILE_TYPE',
            `File type ${file.type} is not supported. Please upload a PDF, Word document, or text file.`
        );
    }

    onProgress({ 
        status: 'uploading', 
        percentage: 5,
        message: 'Preparing file for upload...'
    });

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taxonomy', taxonomy);
    formData.append('timestamp', new Date().toISOString());

    let retryCount = 0;
    
    while (retryCount < MAX_RETRIES) {
        try {
            onProgress({ 
                status: 'uploading', 
                percentage: 10 + (retryCount * 5),
                message: retryCount > 0 ? `Retrying upload (attempt ${retryCount + 1})...` : 'Uploading file to analysis server...'
            });

            console.log(`Sending file to backend at ${ANALYZE_ENDPOINT} (attempt ${retryCount + 1})`);
            
            const response = await fetchWithTimeout(ANALYZE_ENDPOINT, {
                method: 'POST',
                body: formData,
            }, ANALYSIS_TIMEOUT);

            onProgress({ 
                status: 'processing_on_server', 
                percentage: 30,
                message: 'File uploaded successfully. AI is analyzing the contract...'
            });

            if (!response.ok) {
                let errorData: BackendError;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { 
                        error: `Server responded with status: ${response.status}`,
                        details: 'Unable to parse error response from server'
                    };
                }

                // Check if it's a retryable error
                if (response.status >= 500 && retryCount < MAX_RETRIES - 1) {
                    console.warn(`Server error (${response.status}), retrying...`);
                    retryCount++;
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
                    continue;
                }

                throw new ContractAnalysisError(
                    errorData.error || 'Analysis failed',
                    errorData.code || `HTTP_${response.status}`,
                    errorData.details
                );
            }

            console.log("Received successful response from backend");
            
            onProgress({ 
                status: 'finalizing', 
                percentage: 80,
                message: 'Processing analysis results...'
            });

            const analysisResult: AnalysisResult = await response.json();
            
            // Validate the response structure
            if (!analysisResult || typeof analysisResult !== 'object') {
                throw new ContractAnalysisError(
                    'Invalid response from server',
                    'INVALID_RESPONSE',
                    'The server returned an invalid analysis result'
                );
            }

            onProgress({ 
                status: 'complete', 
                percentage: 100,
                message: 'Analysis complete!'
            });

            console.log("Contract analysis completed successfully");
            return analysisResult;

        } catch (error) {
            if (error instanceof ContractAnalysisError) {
                // Don't retry custom errors
                onProgress({ status: 'error', percentage: 100, message: error.message });
                throw error;
            }

            // For network errors, try to retry
            if (retryCount < MAX_RETRIES - 1) {
                console.warn(`Network error, retrying...`, error);
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                continue;
            }

            // Final failure
            console.error("Analysis request failed after all retries:", error);
            onProgress({ 
                status: 'error', 
                percentage: 100,
                message: 'Analysis failed. Please try again.'
            });

            if (error instanceof Error) {
                throw new ContractAnalysisError(
                    error.message,
                    'NETWORK_ERROR',
                    'Unable to connect to the analysis server. Please check your internet connection and try again.'
                );
            }

            throw new ContractAnalysisError(
                'Unknown error occurred',
                'UNKNOWN_ERROR',
                'An unexpected error occurred during analysis. Please try again or contact support.'
            );
        }
    }

    // This should never be reached, but TypeScript needs it
    throw new ContractAnalysisError('Analysis failed after maximum retries', 'MAX_RETRIES_EXCEEDED');
};

// Utility function to get user-friendly error messages
export const getErrorMessage = (error: unknown): { title: string; message: string; canRetry: boolean } => {
    if (error instanceof ContractAnalysisError) {
        switch (error.code) {
            case 'BACKEND_UNAVAILABLE':
                return {
                    title: 'Service Unavailable',
                    message: error.details || error.message,
                    canRetry: true
                };
            case 'TIMEOUT':
                return {
                    title: 'Request Timed Out',
                    message: error.details || 'The analysis took too long to complete.',
                    canRetry: true
                };
            case 'FILE_TOO_LARGE':
                return {
                    title: 'File Too Large',
                    message: error.details || 'Please use a smaller file.',
                    canRetry: false
                };
            case 'INVALID_FILE_TYPE':
                return {
                    title: 'Unsupported File Type',
                    message: error.details || 'Please use a supported file format.',
                    canRetry: false
                };
            case 'NETWORK_ERROR':
                return {
                    title: 'Connection Error',
                    message: error.details || 'Please check your internet connection.',
                    canRetry: true
                };
            default:
                return {
                    title: 'Analysis Error',
                    message: error.message,
                    canRetry: true
                };
        }
    }

    return {
        title: 'Unexpected Error',
        message: 'An unexpected error occurred. Please try again.',
        canRetry: true
    };
};
