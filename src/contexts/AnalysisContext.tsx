import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { AnalysisResult, ChatMessage, AnalysisProgress } from '../types';
import { analyzeContractWithAI, getErrorMessage } from '../services/aiService';

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

  // Helper function to extract text from file
  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!result) {
          reject(new Error('Failed to read file content'));
          return;
        }
        
        // For now, we'll handle text files directly
        // In a real implementation, you'd need libraries for PDF, Word, etc.
        if (file.type === 'text/plain') {
          resolve(result);
        } else if (file.type === 'application/pdf') {
          // For PDF files, you'd need a PDF parsing library
          // For now, we'll provide a placeholder
          reject(new Error('PDF parsing not yet implemented. Please use text files for testing.'));
        } else if (file.type.includes('word') || file.type.includes('document')) {
          // For Word documents, you'd need a document parsing library
          reject(new Error('Word document parsing not yet implemented. Please use text files for testing.'));
        } else {
          // Try to read as text anyway
          resolve(result);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  };

  // Main analysis function
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
        message: 'Reading file content...'
      });

      // Extract text from file
      const contractText = await extractTextFromFile(file);
      
      if (!contractText || contractText.trim().length === 0) {
        throw new Error('No readable content found in the file');
      }

      // Progress: File read successfully
      setAnalysisProgress({
        status: 'processing_on_server',
        percentage: 20,
        message: 'File content extracted. Starting AI analysis...'
      });

      // Call AI service with progress updates
      const result = await analyzeContractWithAI(
        contractText,
        taxonomy,
        true
      );

      if (!result.success || !result.analysis) {
        throw new Error(result.error || 'Analysis failed');
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
