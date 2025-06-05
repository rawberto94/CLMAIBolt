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
    else newExpanded.add(section);
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('[ContractRagAnalyzer] Failed to copy to clipboard:', err);
    }
  };
  
  const exportAnalysis = (analysisToExportParam?: AnalysisResult) => {
    const analysisToExport = analysisToExportParam || currentAnalysis;
    if (!analysisToExport) {
        setUploadError("No analysis selected to export.");
        return;
    }
    const exportData = { ...analysisToExport, exportedAt: new Date().toISOString(), toolVersion: '1.1-RAG-Structured' };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-analysis-${analysisToExport.fileName.split('.')[0]}-${analysisToExport.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCompareContracts = async () => {
    if (selectedAnalyses.length < 2) {
      setUploadError('Please select at least 2 contracts to compare');
      return;
    }
    const analysesToCompare = analyses.filter(a => selectedAnalyses.includes(a.id));
    console.warn("[ContractRagAnalyzer] Contract comparison is using a mock service.");
    const comparison = await compareContracts(analysesToCompare);
    setComparisonResult(comparison);
    setActiveTab('compare');
  };
  
  const addAnnotation = (section: string, textToAnnotate: string) => {
    const newAnnotation: Annotation = {
      id: `anno-${Date.now()}`, text: textToAnnotate, author: 'Current User',
      timestamp: new Date().toISOString(), section, resolved: false
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const getRiskColor = (risk?: string) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return 'text-gray-600';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderAnalysisTab = () => (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Upload Contract(s)</h3>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={batchMode} onChange={(e) => setBatchMode(e.target.checked)} className="rounded text-blue-600"/>
            <span className="text-sm text-gray-600">Batch Mode</span>
          </label>
        </div>
        <div className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-all ${!isInitialized ? 'opacity-50' : 'hover:border-blue-400'}`}>
          <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" multiple={batchMode} onChange={handleFileInput} disabled={!isInitialized || isAnalyzing}/>
          <div onClick={() => !isAnalyzing && fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className={`${isInitialized && !isAnalyzing ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
            {files.length > 0 ? (
              <div className="space-y-3">
                {files.map((fileItem, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div className="text-left">
                        <p className="font-medium text-gray-700">{fileItem.name}</p>
                        <p className="text-sm text-gray-500">{(fileItem.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    {batchMode && (<button onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, i) => i !== index));}} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>)}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-lg font-medium text-gray-700">{batchMode ? 'Upload multiple contracts' : 'Upload your contract'}</p>
                <p className="text-sm text-gray-500">Drag and drop or click to select {batchMode ? 'files' : 'a file'}</p>
                <p className="text-xs text-gray-400 mt-2">Supported: PDF, DOC, DOCX, TXT (Max 10MB each)</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="contractTaxonomy" className="block text-sm font-medium text-gray-700 mb-1">
          Contract Category (Taxonomy)
        </label>
        <select
          id="contractTaxonomy"
          name="contractTaxonomy"
          value={selectedTaxonomy}
          onChange={(e) => setSelectedTaxonomy(e.target.value)}
          disabled={isAnalyzing || !isInitialized || (files.length === 0 && !currentAnalysis)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:opacity-50"
        >
          <option value="" disabled>Select a category...</option>
          {companyTaxonomies.map(taxonomy => (
            <option key={taxonomy} value={taxonomy}>{taxonomy}</option>
          ))}
        </select>
      </div>

      {files.length > 0 && !currentAnalysis && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Analysis Options</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(analysisOptions).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={value} onChange={(e) => setAnalysisOptions(prev => ({...prev, [key]: e.target.checked }))} className="rounded text-blue-600"/>
                <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center gap-3 mb-6">
        <button 
          onClick={() => batchMode ? handleBatchAnalyze() : handleAnalyze()} 
          disabled={files.length === 0 || isAnalyzing || !isInitialized || (!selectedTaxonomy && !batchMode)}
          className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${(files.length === 0 || isAnalyzing || !isInitialized || (!selectedTaxonomy && !batchMode)) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
        >
          {isAnalyzing ? (<><Loader2 className="h-5 w-5 animate-spin" /> Analyzing...</>) : (<><Sparkles className="h-5 w-5" /> {batchMode ? `Analyze ${files.length} Contracts` : 'Analyze Contract'}</>)}
        </button>
        {currentAnalysis && (<button onClick={() => setActiveTab('chat')} className="flex items-center gap-2 px-6 py-3 rounded-md font-medium bg-purple-600 text-white hover:bg-purple-700"><MessageSquare className="h-5 w-5" /> Ask Questions</button>)}
      </div>

      {isAnalyzing && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${analysisProgress}%` }} /></div>
          <p className="text-center text-sm text-gray-500 mt-2">Analyzing contract... {currentFile?.name} {Math.round(analysisProgress)}% Complete</p>
        </div>
      )}

      {currentAnalysis && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Analysis Result for: {currentAnalysis.fileName}</h3>
            <button onClick={() => exportAnalysis()} className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"><Download className="h-4 w-4" />Export</button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => toggleSection('summary')} className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
              <h3 className="text-lg font-semibold flex items-center gap-2"><FileCheck className="h-5 w-5 text-blue-600" />Executive Summary</h3>
              {expandedSections.has('summary') ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.has('summary') && (
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{currentAnalysis.summary}</p>
              </div>
            )}
          </div>
          
          {currentAnalysis.financials && (Object.keys(currentAnalysis.financials).filter(k => currentAnalysis.financials![k as keyof typeof currentAnalysis.financials] !== undefined && currentAnalysis.financials![k as keyof typeof currentAnalysis.financials] !== null && (!Array.isArray(currentAnalysis.financials![k as keyof typeof currentAnalysis.financials]) || (currentAnalysis.financials![k as keyof typeof currentAnalysis.financials] as any[]).length > 0) ) ).length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => toggleSection('financials')} className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5 text-green-600" /> Financial Extracts</h3>
                {expandedSections.has('financials') ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections.has('financials') && (
                <div className="p-6 space-y-3 text-sm">
                  {currentAnalysis.financials.totalContractValue && <p><strong>Total Value:</strong> {currentAnalysis.financials.currency && `${currentAnalysis.financials.currency} `}{currentAnalysis.financials.totalContractValue}</p>}
                  {currentAnalysis.financials.paymentTerms && currentAnalysis.financials.paymentTerms.length > 0 && (
                    <div><strong>Payment Terms:</strong>
                      <ul className="list-disc pl-6 mt-1 space-y-1">
                        {currentAnalysis.financials.paymentTerms.map((pt, i) => <li key={i}>{pt.term}{pt.schedule && ` (${pt.schedule})`}{pt.amount && `: ${currentAnalysis.financials?.currency && `${currentAnalysis.financials.currency} `}${pt.amount}`}</li>)}
                      </ul>
                    </div>
                  )}
                  {currentAnalysis.financials.liabilityCap && <p><strong>Liability Cap:</strong> {currentAnalysis.financials.currency && `${currentAnalysis.financials.currency} `}{currentAnalysis.financials.liabilityCap}</p>}
                  {currentAnalysis.financials.renewalFees && <p><strong>Renewal Fees:</strong> {currentAnalysis.financials.currency && `${currentAnalysis.financials.currency} `}{currentAnalysis.financials.renewalFees}</p>}
                  {currentAnalysis.financials.terminationPenalties && currentAnalysis.financials.terminationPenalties.length > 0 && (
                    <div><strong>Termination Penalties:</strong>
                      <ul className="list-disc pl-6 mt-1 space-y-1">
                        {currentAnalysis.financials.terminationPenalties.map((tp, i) => <li key={i}>{tp.condition}: {currentAnalysis.financials?.currency && `${currentAnalysis.financials.currency} `}{tp.fee}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentAnalysis.keyFindings && currentAnalysis.keyFindings.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => toggleSection('keyFindings')} className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-600" /> Key Findings ({currentAnalysis.keyFindings.length})</h3>
                {expandedSections.has('keyFindings') ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections.has('keyFindings') && (
                <div className="p-6"><div className="grid gap-4 md:grid-cols-2">
                  {currentAnalysis.keyFindings.map((finding, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getRiskColor(finding.risk)}`}>
                      <p className="font-semibold">{finding.label}</p>
                      <p className="text-sm mt-1">{finding.value}</p>
                      <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRiskColor(finding.risk).replace('text-', 'bg-').replace('-600', '-100').replace('bg-50', 'bg-100')} ${getRiskColor(finding.risk).replace('bg-', 'border-')}`}>Risk: {finding.risk}</span>
                    </div>
                  ))}
                </div></div>
              )}
            </div>
          )}
          {currentAnalysis.risks && currentAnalysis.risks.length > 0 && (
             <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => toggleSection('risks')} className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-600" /> Identified Risks ({currentAnalysis.risks.length})</h3>
                {expandedSections.has('risks') ? <ChevronUp /> : <ChevronDown />}
                </button>
                {expandedSections.has('risks') && (
                    <div className="p-6 space-y-3">
                        {currentAnalysis.risks.map((risk, index) => (
                            <div key={index} className={`p-3 rounded border ${getRiskColor(risk.level)}`}>
                                <p><strong>Risk Level:</strong> <span className={`font-semibold ${getRiskColor(risk.level).split(' ')[0]}`}>{risk.level.toUpperCase()}</span></p>
                                <p className="text-sm"><strong>Description:</strong> {risk.description}</p>
                                {risk.mitigation && <p className="text-sm"><strong>Mitigation:</strong> {risk.mitigation}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}
          {/* TODO: Add detailed rendering for Obligations, Clauses, full Metadata */}

          <div className="flex justify-between items-center pt-4">
            <button onClick={() => { setCurrentAnalysis(null); setFiles([]); setCurrentFile(null); setCurrentContractId(null); setRawAnalysisText(null); setSelectedTaxonomy(''); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Analyze New Contract
            </button>
          </div>
        </div>
      )}
    </>
  );

  const renderCompareTab = () => ( /* ... JSX ... */ <p>Compare tab under construction.</p> );
  const renderHistoryTab = () => ( /* ... JSX ... */  
    <div>
      <h3 className="text-lg font-medium mb-4">Analysis History</h3>
      {analyses.length === 0 ? <p>No past analyses found.</p> :
        <ul className="space-y-3">
          {analyses.map(a => (
            <li key={a.id} className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer" onClick={() => {setCurrentAnalysis(a); setActiveTab('analyze');}}>
              <p className="font-medium">{a.fileName} <span className="text-xs text-gray-500">({a.metadata.contractType})</span></p>
              <p className="text-xs text-gray-400">Analyzed: {new Date(a.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      }
    </div>
  );
  const renderChatTab = () => ( /* ... JSX ... */ 
    <div className="flex flex-col h-[500px]">
        <h3 className="text-lg font-medium mb-4">Chat with AI about: {currentAnalysis?.fileName || "current contract"}</h3>
        <div ref={chatScrollRef} className="flex-grow overflow-y-auto mb-4 p-3 bg-gray-50 rounded-md space-y-3">
            {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                        {msg.content}
                    </div>
                </div>
            ))}
            {isProcessingChat && <div className="flex justify-start"><div className="p-3 rounded-lg bg-gray-200 text-gray-800"><Loader2 className="h-5 w-5 animate-spin"/></div></div>}
        </div>
        <div className="flex gap-2">
            <input 
                type="text" 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && !isProcessingChat && handleChatSubmit()}
                placeholder={currentContractId ? "Ask a question about the contract..." : "Analyze a contract to start chatting"}
                className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={!currentContractId || isProcessingChat}
            />
            <button onClick={handleChatSubmit} disabled={!currentContractId || isProcessingChat || !chatInput.trim()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                <Send className="h-5 w-5"/>
            </button>
        </div>
    </div>
  );
  const renderInsightsTab = () => ( /* ... JSX ... */ 
    <div>
      <h3 className="text-lg font-medium mb-4">General Insights & Recommendations</h3>
      {currentAnalysis?.insights && currentAnalysis.insights.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-semibold text-blue-700">Key Insights:</h4>
            <ul className="list-disc pl-5 mt-1 text-sm text-blue-600">
                {currentAnalysis.insights.map((insight, i) => <li key={`insight-${i}`}>{insight}</li>)}
            </ul>
        </div>
      )}
      {currentAnalysis?.recommendations && currentAnalysis.recommendations.length > 0 && (
         <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <h4 className="font-semibold text-green-700">Recommendations:</h4>
            <ul className="list-disc pl-5 mt-1 text-sm text-green-600">
                {currentAnalysis.recommendations.map((rec, i) => <li key={`rec-${i}`}>{rec}</li>)}
            </ul>
        </div>
      )}
       {!(currentAnalysis?.insights?.length) && !(currentAnalysis?.recommendations?.length) && <p>Analyze a contract to see insights and recommendations.</p>}
    </div>
  );
   const renderBenchmarkingTab = () => ( /* ... JSX ... */ 
    <div>
        <h3 className="text-lg font-medium mb-4">Benchmarking</h3>
        {currentAnalysis?.benchmarkingNotes && currentAnalysis.benchmarkingNotes.length > 0 && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-md">
                <h4 className="font-semibold text-indigo-700">Benchmarking Insights (LLM-based):</h4>
                 <ul className="list-disc pl-5 mt-1 text-sm text-indigo-600">
                    {currentAnalysis.benchmarkingNotes.map((note, i) => <li key={`benchmark-${i}`}>{note}</li>)}
                </ul>
            </div>
        )}
        {(!currentAnalysis?.benchmarkingNotes || currentAnalysis.benchmarkingNotes.length === 0) && (
            <p className="text-gray-500">
                {currentAnalysis ? "No specific benchmarking notes generated, or the option was not selected." : "Analyze a contract for benchmarking insights."}
            </p>
        )}
        <p className="mt-4 text-sm text-gray-400">Advanced data-driven benchmarking features are under development.</p>
    </div>
   );

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <FileSearch className="h-6 w-6 text-blue-600" /> AI-Powered Contract Analyzer
            </h2>
            <div className="flex items-center gap-3">
              {isInitialized && !isInitializing && (<span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" />System Ready</span>)}
              {isInitializing && (<span className="flex items-center gap-1 text-sm text-blue-600 animate-pulse"><RefreshCw className="h-4 w-4 animate-spin" />Initializing...</span>)}
              <button onClick={() => setShowSettingsModal(!showSettingsModal)} className="p-2 text-gray-500 hover:text-gray-700"><Settings className="h-5 w-5" /></button>
            </div>
          </div>
        </div>

        {showSettingsModal && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium mb-4">Security & Privacy Settings</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(componentSecuritySettings).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={typeof value === 'boolean' ? value : false}
                    onChange={(e) => setComponentSecuritySettings(prev => ({...prev, [key]: key === 'retentionDays' ? prev.retentionDays : e.target.checked }))}
                    className="rounded text-blue-600" disabled={key === 'retentionDays'}/>
                  <span className="text-gray-600">
                    {key === 'retentionDays' ? `${value} days retention` : key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
          {(['analyze', 'chat', 'insights', 'benchmarking', 'compare', 'history'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
              {tab === 'analyze' && <Upload className="h-4 w-4" />}
              {tab === 'chat' && <MessageSquare className="h-4 w-4" />}
              {tab === 'insights' && <Sparkles className="h-4 w-4" />}
              {tab === 'benchmarking' && <BarChart3 className="h-4 w-4" />}
              {tab === 'compare' && <GitCompare className="h-4 w-4" />}
              {tab === 'history' && <History className="h-4 w-4" />}
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 min-h-[500px]">
          {uploadError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3 text-red-700">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{uploadError}</p>
              </div>
              <button onClick={() => setUploadError(null)} className="p-1 hover:bg-red-100 rounded-full -m-1"><X className="h-4 w-4" /></button>
            </div>
          )}

          {activeTab === 'analyze' && renderAnalysisTab()}
          {activeTab === 'compare' && renderCompareTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'chat' && renderChatTab()}
          {activeTab === 'insights' && renderInsightsTab()}
          {activeTab === 'benchmarking' && renderBenchmarkingTab()}
        </div>
      </div>

      {activeTab !== 'analyze' && isInitialized && (
        <button 
          onClick={() => { 
            setActiveTab('analyze'); 
            if(fileInputRef.current) fileInputRef.current.value = ""; // Clear file input
            setFiles([]); 
            setCurrentFile(null); 
            setCurrentAnalysis(null);
            setSelectedTaxonomy(''); // Reset taxonomy
            setRawAnalysisText(null);
            setUploadError(null);
          }}
          className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50" title="Analyze New Contract">
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default ContractRagAnalyzer;
