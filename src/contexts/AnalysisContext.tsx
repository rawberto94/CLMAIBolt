import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { AnalysisResult, ChatMessage } from '../types'; // This path should be correct from here

interface IAnalysisContext {
  analyses: AnalysisResult[];
  setAnalyses: React.Dispatch<React.SetStateAction<AnalysisResult[]>>;
  currentAnalysis: AnalysisResult | null;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
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
  resetStateForNewAnalysis: () => void;
}

const AnalysisContext = createContext<IAnalysisContext | undefined>(undefined);

export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [currentAnalysis, setCurrentAnalysisState] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('analyze');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentContractId, setCurrentContractId] = useState<string | null>(null);

  const setCurrentAnalysis = (analysis: AnalysisResult | null) => {
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
  }

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
    resetStateForNewAnalysis
  }), [analyses, currentAnalysis, isAnalyzing, uploadError, activeTab, chatMessages, currentContractId]);

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
