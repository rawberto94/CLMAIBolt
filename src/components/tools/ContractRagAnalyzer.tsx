import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText, Upload, Zap, CheckCircle, RefreshCw, AlertTriangle, Download, FileCheck, Clock, Shield,
  AlertCircle, ChevronDown, ChevronUp, Sparkles, X, Copy, Check, MessageSquare, BarChart3,
  GitCompare, FileSearch, Lock, History, Send, Plus, Trash2, Eye, EyeOff, Settings, Filter,
  Calendar, DollarSign, Users, MapPin, Hash, Loader2
} from 'lucide-react';

// REAL SERVICE IMPORTS
import {
  initializeContractRAG as actualInitializeContractRAG,
  addContractFileToRAG,
  analyzeContractWithRAG as actualAnalyzeContractWithRAGStructured,
  TargetJsonStructure, // Ensure this is defined in your service and matches expected fields
} from '../../services/contractRagService'; // Adjust path as needed

import {
  extractTextFromPDF as actualExtractTextFromPDF
} from '../../services/pdfService'; // Adjust path as needed

// Types
interface AnalysisResult {
  id: string;
  summary: string;
  keyFindings: Array<{
    type: string;
    label: string;
    value: string;
    risk: 'low' | 'medium' | 'high';
  }>;
  risks: Array<{
    level: string;
    description: string;
    mitigation?: string;
  }>;
  obligations: Array<{
    description: string;
    dueDate?: string;
    responsible?: string;
    status?: 'pending' | 'completed' | 'overdue';
  }>;
  clauses: Array<{
    type: string;
    title: string;
    content: string;
    location: string;
    importance: 'low' | 'medium' | 'high';
  }>;
  metadata: {
    contractType: string;
    parties: string[];
    effectiveDate: string;
    expirationDate: string;
    value: string; // Often from financialDetails.totalContractValue
    jurisdiction: string;
    renewalTerms?: string;
    confidentiality?: boolean;
  };
  financials?: {
    currency?: string;
    totalContractValue?: string;
    paymentTerms?: Array<{ term: string; schedule?: string; amount?: string }>;
    renewalFees?: string;
    terminationPenalties?: Array<{ condition: string; fee: string }>;
    liabilityCap?: string;
  };
  score: {
    overall: number;
    risk: number;
    compliance: number;
    clarity: number;
  };
  insights: string[];
  recommendations: string[];
  timestamp: string;
  fileName: string;
  benchmarkingNotes?: string[];
}

interface Template {
  id: string;
  name: string;
  type: string;
  clauses: string[];
}

interface Annotation {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  section: string;
  resolved: boolean;
}

const compareContracts = async (analyses: AnalysisResult[]): Promise<any> => {
  console.warn("compareContracts is using a mock implementation.");
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { comparisonSummary: "Contract A has stricter payment terms than Contract B.", differences: [] };
};

const validateFile = async (file: File): Promise<{ valid: boolean; error?: string }> => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  if (file.size > maxSize) return { valid: false, error: 'File size exceeds 10MB limit' };
  if (!allowedTypes.includes(file.type)) return { valid: false, error: 'Invalid file type (PDF, DOC, DOCX, TXT only)' };
  if (securitySettings.virusScan) {
      await new Promise(resolve => setTimeout(resolve, 500));
  }
  return { valid: true };
};

let securitySettings = {
    encryptData: true,
    auditLogging: true,
    virusScan: true,
    retentionDays: 90
};

// Main Component
const ContractRagAnalyzer: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  // const [uploadProgress, setUploadProgress] = useState(0); // Not used in current upload logic
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary', 'keyFindings', 'financials', 'risks'])); // Added more defaults
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analyze' | 'compare' | 'history' | 'chat' | 'insights' | 'benchmarking'>('analyze');
  // const [showAnnotations, setShowAnnotations] = useState(false); // Not actively used in provided JSX
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [rawAnalysisText, setRawAnalysisText] = useState<string | null>(null);
  const [currentContractId, setCurrentContractId] = useState<string | null>(null);

  const [selectedTaxonomy, setSelectedTaxonomy] = useState<string>('');
  const [companyTaxonomies] = useState<string[]>([
    'Banking Services', 'HR Services', 'IT', 'Logistics', 'Marketing',
    'Non-Addressable', 'Outsourcing & Offshoring', 'Professional Services',
    'Real Estate & Facilities Management', 'Travel', 'Other'
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [analysisOptions, setAnalysisOptions] = useState({
    extractDates: true,
    identifyParties: true,
    assessRisks: true,
    findObligations: true,
    detectClauses: true,
    extractFinancials: true,
    deepAnalysis: false,
    benchmarkAgainstPeers: false,
  });

  const [componentSecuritySettings, setComponentSecuritySettings] = useState({
    encryptData: true,
    auditLogging: true,
    virusScan: true,
    retentionDays: 90
  });

  useEffect(() => {
    securitySettings = componentSecuritySettings;
  }, [componentSecuritySettings]);

  useEffect(() => {
    const initRAG = async () => {
      try {
        setIsInitializing(true);
        setUploadError(null);
        await actualInitializeContractRAG();
        setIsInitialized(true);
        console.log("[ContractRagAnalyzer] Contract RAG system initialized successfully.");
        const savedAnalyses = localStorage.getItem('contractAnalyses');
        if (savedAnalyses) {
          setAnalyses(JSON.parse(savedAnalyses));
        }
      } catch (error) {
        console.error("[ContractRagAnalyzer] Failed to initialize RAG system (UI component):", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to initialize the knowledge base.";
        if (errorMessage.includes('API key') || errorMessage.includes('environment variable')) {
            setUploadError("API key for a required service is missing or invalid. Please check your environment configuration.");
        } else if (errorMessage.includes('vector store not initialized')) {
            setUploadError("The analysis engine (vector store) failed to initialize. Please try refreshing.");
        } else {
            setUploadError(`Initialization failed: ${errorMessage}. Please try again later.`);
        }
      } finally {
        setIsInitializing(false);
      }
    };
    initRAG();
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (analyses.length > 0) {
      localStorage.setItem('contractAnalyses', JSON.stringify(analyses));
    }
  }, [analyses]);

  const simulateAnalysisProgress = () => {
    setAnalysisProgress(0);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 10 + 5;
      if (currentProgress >= 100) {
        setAnalysisProgress(100);
        clearInterval(interval);
      } else {
        setAnalysisProgress(currentProgress);
      }
    }, 300);
    return interval;
  };

  const handleFile = async (file: File) => {
    const validation = await validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }
    if (batchMode) {
      setFiles(prev => [...prev, file]);
    } else {
      setCurrentFile(file);
      setFiles([file]);
    }
    // setUploadProgress(100); // Not displayed, local file handling is instant
    setUploadError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (batchMode) {
      droppedFiles.forEach(handleFile);
    } else if (droppedFiles.length > 0) {
      handleFile(droppedFiles[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    if (batchMode) {
      Array.from(selectedFiles).forEach(handleFile);
    } else if (selectedFiles.length > 0) {
      handleFile(selectedFiles[0]);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => e.target?.result ? resolve(e.target.result as string) : reject(new Error("Failed to read file content"));
      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsText(file);
    });
  };

  const handleAnalyze = async (fileToAnalyze?: File) => {
    const file = fileToAnalyze || currentFile;
    if (!file) {
      setUploadError("Please upload a contract file first.");
      return;
    }
    if (!isInitialized) {
      setUploadError("Analysis system is not ready. Please wait for initialization.");
      return;
    }
    if (!selectedTaxonomy && !batchMode) {
        setUploadError("Please select a contract category (taxonomy) first.");
        return;
    }

    setIsAnalyzing(true);
    setUploadError(null);
    setRawAnalysisText(null);
    setCurrentAnalysis(null);
    const progressInterval = simulateAnalysisProgress();

    try {
      let fileContent: string;
      if (file.type === 'application/pdf') {
        fileContent = await actualExtractTextFromPDF(file); // Correct usage of alias
      } else if (file.type.startsWith('text/') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        console.warn(`[ContractRagAnalyzer] Reading ${file.type} as plain text. For DOC/DOCX, specialized parsing is recommended.`);
        fileContent = await readFileAsText(file);
      } else {
        throw new Error(`Unsupported file type: ${file.type}.`);
      }

      if (!fileContent || fileContent.trim() === '') {
        throw new Error("No text content could be extracted. File might be empty or image-only PDF (OCR not performed).");
      }

      const newContractId = `contract_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
      setCurrentContractId(newContractId);

      await addContractFileToRAG(newContractId, file, {
        fileName: file.name,
        userProvidedType: selectedTaxonomy || "Not specified",
      });
      console.log(`[ContractRagAnalyzer] Contract ${newContractId} (file: ${file.name}, taxonomy: ${selectedTaxonomy}) added to RAG store.`);

      let userQuery = "Provide a comprehensive structured analysis of this contract. ";
      if (analysisOptions.assessRisks) userQuery += "Identify potential risks, their severity, and mitigations. ";
      if (analysisOptions.findObligations) userQuery += "List key obligations, responsible parties, and due dates. ";
      if (analysisOptions.detectClauses) userQuery += "Extract and summarize important clauses with their locations. ";
      if (analysisOptions.extractFinancials) userQuery += "Extract detailed financial information including contract value, payment terms, penalties, and liability caps. ";
      if (analysisOptions.benchmarkAgainstPeers) userQuery += "Provide brief benchmarking insights compared to typical contracts of this type. ";
      if (analysisOptions.deepAnalysis) userQuery += "Perform a deep and detailed analysis. ";
      
      const analysisServiceOptions = {
        targetContractId: newContractId,
        retrieveSimilarContext: true,
        taxonomy: selectedTaxonomy || undefined,
        maxChunksFromTarget: 3,
        maxSimilarDocs: 2
      };

      console.log(`[ContractRagAnalyzer] Analyzing with query: "${userQuery}" for contractId: ${newContractId}, taxonomy: ${selectedTaxonomy}`);
      
      const structuredAnalysisResult = await actualAnalyzeContractWithRAGStructured(
        fileContent,
        userQuery.trim(),
        analysisServiceOptions
      ) as TargetJsonStructure; // Cast assuming service returns TargetJsonStructure for non-chat
      
      console.log("[ContractRagAnalyzer] Received structured analysis from service:", structuredAnalysisResult);

      // Map TargetJsonStructure to your UI's AnalysisResult
      // Ensure TargetJsonStructure has all fields you attempt to map here (e.g., governingLaw, renewalInformation etc.)
      const newUiAnalysis: AnalysisResult = {
        id: newContractId,
        fileName: file.name,
        timestamp: new Date().toISOString(),
        summary: structuredAnalysisResult.executiveSummary || "Summary not available.",
        metadata: {
          contractType: structuredAnalysisResult.contractTaxonomy || structuredAnalysisResult.documentType || selectedTaxonomy || 'N/A',
          parties: structuredAnalysisResult.partiesInvolved?.map((p: any) => p.name) || [],
          effectiveDate: structuredAnalysisResult.keyDates?.effectiveDate || 'N/A',
          expirationDate: structuredAnalysisResult.keyDates?.expirationDate || 'N/A',
          value: structuredAnalysisResult.financialDetails?.totalContractValue?.toString() || 'N/A',
          jurisdiction: (structuredAnalysisResult as any).governingLaw || 'N/A', // Assuming governingLaw on TargetJsonStructure
          renewalTerms: (structuredAnalysisResult as any).renewalInformation?.terms || undefined, // Assuming renewalInformation on TargetJsonStructure
          confidentiality: (structuredAnalysisResult as any).confidentiality?.isConfidential || false, // Assuming confidentiality on TargetJsonStructure
        },
        keyFindings: (structuredAnalysisResult as any).keyHighlights?.map((kh: any) => ({
            type: kh.category || 'general',
            label: kh.title || 'Key Finding',
            value: kh.description,
            risk: kh.riskLevel || 'medium'
        })) || [],
        risks: structuredAnalysisResult.identifiedRisks?.map((r: any) => ({
          level: r.level,
          description: r.description,
          mitigation: r.mitigation
        })) || [],
        obligations: structuredAnalysisResult.keyObligations?.map((o: any) => ({
          description: o.description,
          responsible: o.responsibleParty,
          dueDate: o.dueDate,
          status: o.status || 'pending'
        })) || [],
        clauses: (structuredAnalysisResult as any).extractedClauses?.map((c:any) => ({
            type: c.type,
            title: c.title,
            content: c.summary || c.verbatim,
            location: c.location_in_document,
            importance: c.importance || 'medium'
        })) || [],
        financials: structuredAnalysisResult.financialDetails ? {
            currency: structuredAnalysisResult.financialDetails.currency || undefined,
            totalContractValue: structuredAnalysisResult.financialDetails.totalContractValue?.toString() || undefined,
            paymentTerms: structuredAnalysisResult.financialDetails.paymentTerms?.map((pt: any) => ({ term: pt.term, schedule: pt.schedule, amount: pt.amount?.toString()})),
            renewalFees: structuredAnalysisResult.financialDetails.renewalFees?.toString() || undefined,
            terminationPenalties: structuredAnalysisResult.financialDetails.terminationPenalties?.map((tp: any)=>({condition: tp.condition, fee: tp.fee?.toString()})),
            liabilityCap: structuredAnalysisResult.financialDetails.liabilityCap?.toString() || undefined,
        } : undefined,
        score: (structuredAnalysisResult as any).contractScore || { overall: 0, risk: 0, compliance: 0, clarity: 0 },
        insights: (structuredAnalysisResult as any).generalInsights || [],
        recommendations: structuredAnalysisResult.recommendations || [],
        benchmarkingNotes: structuredAnalysisResult.benchmarkingInsights || [],
      };

      setCurrentAnalysis(newUiAnalysis);
      console.log('[ContractRagAnalyzer] currentAnalysis object set in UI state:', newUiAnalysis);

      setAnalyses(prev => {
        const existingIndex = prev.findIndex(a => a.id === newContractId);
        if (existingIndex !== -1) {
          const updatedAnalyses = [...prev];
          updatedAnalyses[existingIndex] = newUiAnalysis;
          return updatedAnalyses;
        }
        return [newUiAnalysis, ...prev];
      });
      setRawAnalysisText(JSON.stringify(structuredAnalysisResult, null, 2));

    } catch (error) {
      console.error('[ContractRagAnalyzer] Error in handleAnalyze (UI component):', error);
      setUploadError(error instanceof Error ? error.message : "An unexpected error occurred during analysis.");
      setCurrentContractId(null);
    } finally {
      setIsAnalyzing(false);
      clearInterval(progressInterval);
      setAnalysisProgress(100);
    }
  };

  const handleBatchAnalyze = async () => {
    if (files.length === 0) {
        setUploadError("No files selected for batch analysis.");
        return;
    }
    if (!selectedTaxonomy) {
        setUploadError("Please select a contract category (taxonomy) for the batch.");
        return;
    }
    setIsAnalyzing(true);
    for (const file of files) {
        setUploadError(null);
        setCurrentFile(file); // Update currentFile for progress display
        console.log(`[ContractRagAnalyzer] Batch analyzing: ${file.name}`);
        await handleAnalyze(file);
    }
    setIsAnalyzing(false);
    setCurrentFile(null);
    console.log("[ContractRagAnalyzer] Batch analysis completed.");
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    if (!currentContractId) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Please analyze a contract first to discuss it." }]);
      return;
    }

    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsProcessingChat(true);

    const activeAnalysis = analyses.find(a => a.id === currentContractId);
    let contextForChat = rawAnalysisText; // Use full JSON of last analysis as context

    if (!contextForChat && activeAnalysis?.summary) { // Fallback
        console.warn("[ContractRagAnalyzer] Chat is using analysis summary as context.");
        contextForChat = activeAnalysis.summary;
    }

    if (!contextForChat) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I could not retrieve the contract context." }]);
        setIsProcessingChat(false);
        return;
    }

    try {
      const chatServiceOptions = {
        targetContractId: currentContractId,
        retrieveSimilarContext: true,
        taxonomy: activeAnalysis?.metadata.contractType,
        isChatQuery: true,
      };

      const assistantResponse = await actualAnalyzeContractWithRAGStructured(
        contextForChat,
        userMessage,
        chatServiceOptions
      );
      
      console.log('[ContractRagAnalyzer] Chat response received for UI:', assistantResponse);
      setChatMessages(prev => [...prev, { role: 'assistant', content: assistantResponse as string }]);

    } catch (error) {
      console.error("[ContractRagAnalyzer] Error processing chat (UI component):", error);
      const chatErrorMsg = error instanceof Error ? error.message : "Sorry, I encountered an issue processing your question.";
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: ${chatErrorMsg}` }]);
    } finally {
      setIsProcessingChat(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) newExpanded.delete(section);
