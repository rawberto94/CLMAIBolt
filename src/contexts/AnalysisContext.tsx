import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { AnalysisResult, ChatMessage, AnalysisProgress } from '../types';
import { handleAnalysisRequest, getErrorMessage } from '../services/contractRagService';
import { extractTextFromDocument } from '../services/documentService'; // Use the new orchestrator

// Extended AnalysisResult with id for context management
export interface AnalysisResultWithId extends AnalysisResult {
  id: string;
  fileName?: string;
  uploadDate?: string;
  fileSize?: number;
}

interface IAnalysisContext {
  analyses: AnalysisResultWithId[];
  setAnalyses: React.Dispatch<React.SetStateAction<AnalysisResultWithId[]>>;
  currentAnalysis: AnalysisResultWithId | null;
  setCurrentAnalysis: (analysis: AnalysisResultWithId | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  uploadError: string | null;
  setUploadError: React.Dispatch<React.SetStateAction<string | null>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  currentContractId: string | null;
  setCurrentContractId: React.Dispatch<React.SetStateAction<string | null>>;
  analysisProgress: AnalysisProgress | null;
  setAnalysisProgress: React.Dispatch<React.SetStateAction<AnalysisProgress | null>>;
  resetStateForNewAnalysis: () => void;
  // New methods for AI analysis
  analyzeFile: (file: File, taxonomy?: string) => Promise<void>;
  retryAnalysis: () => Promise<void>;
  canRetry: boolean;
}

const AnalysisContext = createContext<IAnalysisContext | undefined>(undefined);

export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [analyses, setAnalyses] = useState<AnalysisResultWithId[]>([]);
  const [currentAnalysis, setCurrentAnalysisState] = useState<AnalysisResultWithId | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('analyze');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentContractId, setCurrentContractId] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);
  const [lastAnalysisAttempt, setLastAnalysisAttempt] = useState<{
    file: File;
    taxonomy: string;
  } | null>(null);

  const setCurrentAnalysis = (analysis: AnalysisResultWithId | null) => {
    setCurrentAnalysisState(analysis);
    setCurrentContractId(analysis?.id ?? null);
    setChatMessages([]);
  };

  const resetStateForNewAnalysis = () => {
    setCurrentAnalysis(null);
    setUploadError(null);
    setActiveTab('analyze');
    setChatMessages([]);
    setCurrentContractId(null);
    setAnalysisProgress(null);
    setLastAnalysisAttempt(null);
    setIsAnalyzing(false);
  };

  // Helper function to extract text from file using your existing services
  const extractTextFromFile = async (file: File): Promise<string> => {
    console.log(`[AnalysisContext] Extracting text from ${file.type} file: ${file.name}`);
    
    try {
      // Use the smart document service that handles everything
      return await extractTextFromDocument(file);
    } catch (error) {
      console.error('[AnalysisContext] Text extraction failed:', error);
      throw error;
    }
  };

  // Main analysis function - now uses the smart document service
  const analyzeFile = async (file: File, taxonomy: string = 'standard'): Promise<void> => {
    console.log('[AnalysisContext] Starting file analysis:', file.name);
    
    // Reset state
    setUploadError(null);
    setAnalysisProgress(null);
    setIsAnalyzing(true);
    
    // Store the attempt for retry functionality
    setLastAnalysisAttempt({ file, taxonomy });

    try {
      // Progress: Starting file processing
      setAnalysisProgress({
        status: 'uploading',
        percentage: 5,
        message: 'Processing document...'
      });

      // Extract text using the smart document service
      console.log('[AnalysisContext] Extracting text using document service...');
      const contractText = await extractTextFromDocument(file);
      
      if (!contractText || contractText.trim().length === 0) {
        throw new Error('No readable content found in the document');
      }

      if (contractText.length < 50) {
        throw new Error('Document contains very little text. Please check if the file is valid.');
      }

      // Progress: File processed successfully
      setAnalysisProgress({
        status: 'processing_on_server',
        percentage: 30,
        message: `Document processed successfully. Extracted ${contractText.length} characters. Starting AI analysis...`
      });

      // Call AI service with progress updates
      const result = await handleAnalysisRequest(
        contractText,
        taxonomy,
        true
      );

      if (!result.success || !result.analysis) {
        throw new Error(result.error || 'AI analysis failed');
      }

      // Progress: Analysis complete
      setAnalysisProgress({
        status: 'finalizing',
        percentage: 90,
        message: 'Processing analysis results...'
      });

      // Create analysis result with ID and metadata
      const analysisWithId: AnalysisResultWithId = {
        ...(result.analysis as AnalysisResult),
        id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        fileSize: file.size
      };

      // Update state
      setAnalyses(prev => [analysisWithId, ...prev]);
      setCurrentAnalysis(analysisWithId);
      
      // Final progress
      setAnalysisProgress({
        status: 'complete',
        percentage: 100,
        message: 'Analysis complete!'
      });

      console.log('[AnalysisContext] Analysis completed successfully');

    } catch (error) {
      console.error('[AnalysisContext] Analysis failed:', error);
      
      const errorInfo = getErrorMessage(error);
      setUploadError(errorInfo.message);
      
      setAnalysisProgress({
        status: 'error',
        percentage: 100,
        message: errorInfo.title
      });
    } finally {
      setIsAnalyzing(false);
      
      // Clear progress after a delay
      setTimeout(() => {
        setAnalysisProgress(null);
      }, 3000);
    }
  };

  // Retry analysis function
  const retryAnalysis = async (): Promise<void> => {
    if (!lastAnalysisAttempt) {
      console.warn('[AnalysisContext] No previous analysis attempt to retry');
      return;
    }

    console.log('[AnalysisContext] Retrying analysis');
    await analyzeFile(lastAnalysisAttempt.file, lastAnalysisAttempt.taxonomy);
  };

  // Check if retry is possible
  const canRetry = Boolean(lastAnalysisAttempt && !isAnalyzing);

  const value = useMemo(() => ({
    analyses,
    setAnalyses,
    currentAnalysis,
    setCurrentAnalysis,
    isAnalyzing,
    setIsAnalyzing,
    uploadError,
    setUploadError,
    activeTab,
    setActiveTab,
    chatMessages,
    setChatMessages,
    currentContractId,
    setCurrentContractId,
    analysisProgress,
    setAnalysisProgress,
    resetStateForNewAnalysis,
    analyzeFile,
    retryAnalysis,
    canRetry
  }), [
    analyses,
    currentAnalysis,
    isAnalyzing,
    uploadError,
    activeTab,
    chatMessages,
    currentContractId,
    analysisProgress,
    canRetry
  ]);

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysisContext = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysisContext must be used within an AnalysisProvider');
  }
  return context;
};
