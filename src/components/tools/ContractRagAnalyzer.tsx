import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  Upload,
  Zap,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Download,
  FileCheck,
  Clock,
  Shield,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  Copy,
  Check,
  MessageSquare,
  BarChart3,
  GitCompare,
  FileSearch,
  Lock,
  History,
  Send,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Filter,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Hash,
  Loader2
} from 'lucide-react';

// REAL SERVICE IMPORTS
import {
  initializeContractRAG as actualInitializeContractRAG,
  addContractFileToRAG,
  analyzeContractWithRAG as actualAnalyzeContractWithRAG
} from '../../services/contractRagService'; // Adjust path as needed

import {
  extractTextFromPDF as actualExtractTextFromPDF
} from '../../services/pdfService'; // Adjust path as needed

// Types (remain the same for UI structure)
interface AnalysisResult {
  id: string; // Will now be the contractId
  summary: string; // Will hold the raw analysis string for now
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
    value: string;
    jurisdiction: string;
    renewalTerms?: string;
    confidentiality?: boolean;
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
  // Optional: consider adding the full contract text here for easier access by chat
  // contractText?: string;
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

// Remaining Mock service functions (for features not yet integrated with backend)
// TODO: Replace these with actual service implementations as features are built out
const compareContracts = async (analyses: AnalysisResult[]): Promise<any> => {
  console.warn("compareContracts is using a mock implementation.");
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { /* ... mock comparison data ... */ };
};
const extractClauses = async (content: string, clauseTypes: string[]): Promise<any[]> => {
  console.warn("extractClauses is using a mock implementation.");
  await new Promise(resolve => setTimeout(resolve, 1500));
  return clauseTypes.map(type => ({ type, found: true, content: `Sample ${type} clause...` }));
};
const generateInsights = async (analysis: AnalysisResult): Promise<string[]> => {
  console.warn("generateInsights is using a mock implementation.");
  await new Promise(resolve => setTimeout(resolve, 1000));
  return ['Mock insight 1', 'Mock insight 2'];
};
const calculateContractScore = async (analysis: AnalysisResult): Promise<any> => {
  console.warn("calculateContractScore is using a mock implementation.");
  await new Promise(resolve => setTimeout(resolve, 500));
  return { overall: 75, breakdown: { clarity: 80, riskManagement: 70 } };
};
const matchTemplate = async (content: string, templates: Template[]): Promise<any> => {
  console.warn("matchTemplate is using a mock implementation.");
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { bestMatch: templates[0] || null, confidence: 0.7 };
};
// Validation and Security Functions (can be kept as is or enhanced)
const validateFile = async (file: File): Promise<{ valid: boolean; error?: string }> => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  if (file.size > maxSize) return { valid: false, error: 'File size exceeds 10MB limit' };
  if (!allowedTypes.includes(file.type)) return { valid: false, error: 'Invalid file type (PDF, DOC, DOCX, TXT only)' };
  // Simulate virus scan - in a real app, this would be a backend call if done seriously
  if (securitySettings.virusScan) { // Assuming securitySettings is accessible
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate scan
  }
  return { valid: true };
};


// Global variable for security settings (since it's used in validateFile)
// This should ideally be managed better if validateFile is truly external.
// For now, assuming it's part of the same module context or passed appropriately.
let securitySettings = { // Default values
    encryptData: true,
    auditLogging: true,
    virusScan: true, // This is used by the mock validateFile
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary', 'keyFindings']));
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analyze' | 'compare' | 'history' | 'chat' | 'insights'>('analyze');
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false); // Renamed from showSettings

  // New state for actual RAG integration
  const [rawAnalysisText, setRawAnalysisText] = useState<string | null>(null); // To store raw output from service
  const [currentContractId, setCurrentContractId] = useState<string | null>(null); // To track the ID of the current contract

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [analysisOptions, setAnalysisOptions] = useState({
    extractDates: true,
    identifyParties: true,
    assessRisks: true,
    findObligations: true,
    detectClauses: true,
    generateInsights: true, // This will be a TODO for real service
    calculateScore: true,   // This will be a TODO for real service
    matchTemplates: false,  // This will be a TODO for real service
    deepAnalysis: false     // This can be a flag for more thorough RAG/LLM processing
  });

  // Security settings state moved inside the component
  const [componentSecuritySettings, setComponentSecuritySettings] = useState({
    encryptData: true,
    auditLogging: true,
    virusScan: true,
    retentionDays: 90
  });
  // Update global securitySettings when component's settings change
  useEffect(() => {
    securitySettings = componentSecuritySettings;
  }, [componentSecuritySettings]);


  // Initialize RAG system
  useEffect(() => {
    const initRAG = async () => {
      try {
        setIsInitializing(true);
        setUploadError(null);
        await actualInitializeContractRAG(); // REAL SERVICE CALL
        setIsInitialized(true);
        console.log("Contract RAG system initialized successfully.");

        const savedAnalyses = localStorage.getItem('contractAnalyses');
        if (savedAnalyses) {
          setAnalyses(JSON.parse(savedAnalyses));
        }
      } catch (error) {
        console.error("Failed to initialize RAG system:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to initialize the knowledge base.";
        if (errorMessage.includes('API key') || errorMessage.includes('environment variable')) {
            setUploadError("API key for a required service is missing or invalid. Please check your environment configuration (e.g., .env file for VITE_GEMINI_API_KEY).");
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
      currentProgress += Math.random() * 10 + 5; // More realistic steps
      if (currentProgress >= 100) {
        setAnalysisProgress(100);
        clearInterval(interval);
      } else {
        setAnalysisProgress(currentProgress);
      }
    }, 300);
    return interval; // Return interval to clear it if analysis stops early
  };

  const handleFile = async (file: File) => {
    const validation = await validateFile(file); // Uses securitySettings.virusScan
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }
    if (batchMode) {
      setFiles(prev => [...prev, file]);
    } else {
      setCurrentFile(file); // Set current file for single analysis
      setFiles([file]);
    }
    // simulateUpload(); // This seems to be just for visual progress, can be kept or removed
    setUploadProgress(100); // Assume quick "upload" locally
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

  // readFileAsText remains the same
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error("Failed to read file content"));
        }
      };
      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsText(file);
    });
  };

  const handleAnalyze = async (fileToAnalyze?: File) => {
    const file = fileToAnalyze || currentFile; // Use currentFile if no specific file passed (for single mode)
    if (!file) {
      setUploadError("Please upload a contract file first.");
      return;
    }
    if (!isInitialized) {
      setUploadError("Analysis system is not ready. Please wait for initialization to complete.");
      return;
    }

    setIsAnalyzing(true);
    setUploadError(null);
    setRawAnalysisText(null);
    setCurrentAnalysis(null);
    const progressInterval = simulateAnalysisProgress();

    try {
      let fileContent: string;
      console.log(`Extracting text from: ${file.name}, type: ${file.type}`);
      if (file.type === 'application/pdf') {
        fileContent = await actualExtractTextFromPDF(file); // REAL SERVICE CALL
      } else if (file.type.startsWith('text/') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        // Assuming readFileAsText can handle these or you have a DOCX parser
        // For DOC/DOCX, actualExtractTextFromPDF (if enhanced) or a dedicated parser would be better
        console.warn(`Reading ${file.type} as plain text. For DOC/DOCX, specialized parsing is recommended.`);
        fileContent = await readFileAsText(file);
      } else {
        throw new Error(`Unsupported file type: ${file.type}. Please upload PDF, TXT, DOC, or DOCX.`);
      }
      console.log(`Extracted text length: ${fileContent.length}`);

      if (!fileContent || fileContent.trim() === '') {
        throw new Error("No text content could be extracted from the file. It might be empty or an image-only PDF not processed by OCR.");
      }

      const newContractId = `contract_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
      setCurrentContractId(newContractId); // Set for chat and other potential follow-ups

      // TODO: Collect richer metadata from user if available (e.g., contract type, parties)
      await addContractFileToRAG(newContractId, file, {
        fileName: file.name, // Already added by service, but good to have consistent source
        userProvidedType: "Not specified" // Example of potential user metadata
      });
      console.log(`Contract ${newContractId} (file: ${file.name}) added to RAG store.`);

      let userQuery = "Provide a comprehensive analysis of this contract. ";
      if (analysisOptions.assessRisks) userQuery += "Identify potential risks and their severity. ";
      if (analysisOptions.findObligations) userQuery += "List key obligations for all parties involved. ";
      if (analysisOptions.detectClauses) userQuery += "Extract and summarize important clauses. ";
      if (analysisOptions.deepAnalysis) userQuery += "Perform a deep and detailed analysis. ";
      // TODO: Map other analysisOptions to the query or to how results are processed later

      console.log(`Analyzing with query: "${userQuery}" for contractId: ${newContractId}`);
      const analysisStringResult = await actualAnalyzeContractWithRAG(
        fileContent,
        userQuery.trim(),
        {
          targetContractId: newContractId,
          retrieveSimilarContext: true, // Or from analysisOptions.matchTemplates
          maxChunksFromTarget: 3,
          maxSimilarDocs: 2
        }
      );
      console.log("Analysis string received from service.");
      setRawAnalysisText(analysisStringResult);

      // TODO: This is a temporary way to display results.
      // The long-term solution is to get structured JSON from the LLM.
      const tempStructuredResult: AnalysisResult = {
        id: newContractId,
        summary: analysisStringResult, // Main analysis string displayed as summary
        keyFindings: [], risks: [], obligations: [], clauses: [], // These will be empty
        metadata: {
          contractType: 'Pending detailed extraction', parties: [], effectiveDate: '', expirationDate: '',
          value: '', jurisdiction: '', confidentiality: false,
        },
        score: { overall: 0, risk: 0, compliance: 0, clarity: 0 }, // Mock scores
        insights: [], recommendations: [],
        timestamp: new Date().toISOString(),
        fileName: file.name,
      };
      setCurrentAnalysis(tempStructuredResult);
      // Update analyses list, replacing if ID exists, otherwise prepending
      setAnalyses(prev => {
        const existingIndex = prev.findIndex(a => a.id === newContractId);
        if (existingIndex !== -1) {
          const updatedAnalyses = [...prev];
          updatedAnalyses[existingIndex] = tempStructuredResult;
          return updatedAnalyses;
        }
        return [tempStructuredResult, ...prev];
      });
      
      // TODO: Replace mock calls for generateInsights & calculateContractScore
      // These would require further LLM calls based on 'analysisStringResult' or a more structured initial result.
      // if (analysisOptions.generateInsights) {
      //   const insights = await generateInsights(tempStructuredResult); // MOCK
      //   setCurrentAnalysis(prev => prev ? ({ ...prev, insights: [...prev.insights, ...insights] }) : null);
      // }
      // if (analysisOptions.calculateScore) {
      //   const detailedScore = await calculateContractScore(tempStructuredResult); // MOCK
      //   setCurrentAnalysis(prev => prev ? ({ ...prev, score: { ...prev.score, ...detailedScore.breakdown } }) : null);
      // }

    } catch (error) {
      console.error('Error in handleAnalyze:', error);
      setUploadError(error instanceof Error ? error.message : "An unexpected error occurred during analysis.");
      setCurrentContractId(null);
    } finally {
      setIsAnalyzing(false);
      clearInterval(progressInterval); // Clear interval
      setAnalysisProgress(100);      // Ensure it shows 100%
    }
  };

  const handleBatchAnalyze = async () => {
    if (files.length === 0) {
        setUploadError("No files selected for batch analysis.");
        return;
    }
    setIsAnalyzing(true); // Set analyzing state for the whole batch
    for (const file of files) {
        setUploadError(null); // Clear error for each file
        setCurrentFile(file); // Visually indicate which file is being processed
        console.log(`Batch analyzing: ${file.name}`);
        await handleAnalyze(file); // Call existing handleAnalyze for each file
        // Optional: add a delay or check status if needed between analyses
    }
    setIsAnalyzing(false); // Reset analyzing state after batch
    setCurrentFile(null); // Clear current file indicator
    console.log("Batch analysis completed.");
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

    // Attempt to retrieve the contract text for the currentContractId
    // This requires storing the text or having an efficient way to get it.
    // For now, we'll try to find the 'summary' which holds the raw analysis text,
    // which is the full contract text from the LLM's perspective in the first analysis.
    // This is a simplification and might not always be the original full text for subsequent queries.
    const activeAnalysis = analyses.find(a => a.id === currentContractId);
    let contractTextForChat = rawAnalysisText; // Prefer the most recently analyzed full text

    if (!contractTextForChat && activeAnalysis) {
        // Fallback to summary if rawAnalysisText isn't set (e.g. page reloaded, only localStorage data)
        // This assumes summary after initial analysis contains enough for follow-up.
        // A better solution is to store full extracted text with analysis or re-fetch.
        console.warn("Chat is using analysis summary as contract text, this might not be the original full text.");
        contractTextForChat = activeAnalysis.summary;
    }


    if (!contractTextForChat) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I could not retrieve the contract text to discuss further." }]);
        setIsProcessingChat(false);
        return;
    }

    try {
      const assistantResponse = await actualAnalyzeContractWithRAG(
        contractTextForChat, // Text of the contract being discussed
        userMessage,         // User's current question
        {
          targetContractId: currentContractId, // Crucial for context from THIS contract
          retrieveSimilarContext: true,      // Allow context from other contracts too
          maxChunksFromTarget: 3,
          maxSimilarDocs: 1
        }
      );
      setChatMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
    } catch (error) {
      console.error("Error processing chat:", error);
      const chatErrorMsg = error instanceof Error ? error.message : "Sorry, I encountered an issue processing your question.";
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: ${chatErrorMsg}` }]);
    } finally {
      setIsProcessingChat(false);
    }
  };


  // UI Functions (toggleSection, copyToClipboard, exportAnalysis, handleCompareContracts, addAnnotation, getRiskColor, getScoreColor)
  // remain largely the same. Ensure exportAnalysis uses the simplified currentAnalysis.

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
      console.error('Failed to copy:', err);
      // TODO: Show a user-facing error message for clipboard failure
    }
  };
  
  const exportAnalysis = (analysisToExport?: AnalysisResult) => {
    const data = analysisToExport || currentAnalysis;
    if (!data) {
        setUploadError("No analysis selected to export.");
        return;
    }
    // For now, we export the simplified structure (summary has the raw text)
    const exportData = {
        id: data.id,
        fileName: data.fileName,
        analysisTimestamp: data.timestamp,
        rawAnalysisOutput: data.summary, // Main content
        // Include other available fields, even if mock or default
        metadata: data.metadata,
        score: data.score,
        exportedAt: new Date().toISOString(),
        toolVersion: '1.0-RAG-Integrated' // Example version
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-analysis-${data.fileName.split('.')[0]}-${data.id}.json`;
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
    // TODO: Replace with actual service call for comparison
    console.warn("Contract comparison is using a mock service.");
    const comparison = await compareContracts(analysesToCompare); // MOCK
    setComparisonResult(comparison);
  };
  
  const addAnnotation = (section: string, text: string) => {
    // This is a mock implementation
    const newAnnotation: Annotation = {
      id: `anno-${Date.now()}`, text, author: 'Current User',
      timestamp: new Date().toISOString(), section, resolved: false
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const getRiskColor = (risk: string) => {
    // This is for the mock data structure, may need adjustment
    switch (risk?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };


  // Render Functions (renderAnalysisTab, renderCompareTab, etc.)
  // These will need significant updates if you want to display the fully structured AnalysisResult
  // For now, renderAnalysisTab is modified to show currentAnalysis.summary (the raw string)

  const renderAnalysisTab = () => (
    <>
      <div className="mb-6"> {/* Upload Section */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Upload Contract</h3>
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
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div className="text-left">
                        <p className="font-medium text-gray-700">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    {batchMode && (<button onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, i) => i !== index));}} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>)}
                  </div>
                ))}
                {/* Removed uploadProgress bar as local file handling is instant */}
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

      {files.length > 0 && !currentAnalysis && ( // Show options only before analysis or if no analysis yet
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

      <div className="flex justify-center gap-3">
        <button onClick={() => batchMode ? handleBatchAnalyze() : handleAnalyze()} disabled={files.length === 0 || isAnalyzing || !isInitialized}
          className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${(files.length === 0 || isAnalyzing || !isInitialized) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'}`}>
          {isAnalyzing ? (<><Loader2 className="h-5 w-5 animate-spin" /> Analyzing...</>) : (<><Sparkles className="h-5 w-5" /> {batchMode ? `Analyze ${files.length} Contracts` : 'Analyze Contract'}</>)}
        </button>
        {currentAnalysis && (<button onClick={() => setActiveTab('chat')} className="flex items-center gap-2 px-6 py-3 rounded-md font-medium bg-purple-600 text-white hover:bg-purple-700"><MessageSquare className="h-5 w-5" /> Ask Questions</button>)}
      </div>

      {isAnalyzing && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${analysisProgress}%` }} /></div>
          <p className="text-center text-sm text-gray-500 mt-2">Analyzing contract... {Math.round(analysisProgress)}% Complete</p>
        </div>
      )}

      {currentAnalysis && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Analysis Result for: {currentAnalysis.fileName}</h3>
            <button onClick={() => exportAnalysis()} className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"><Download className="h-4 w-4" />Export</button>
          </div>

          {/* --- MODIFIED SUMMARY SECTION TO DISPLAY RAW TEXT --- */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => toggleSection('summary')} className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors">
              <h3 className="text-lg font-semibold flex items-center gap-2"><FileCheck className="h-5 w-5 text-blue-600" />AI Analysis Output</h3>
              {expandedSections.has('summary') ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.has('summary') && (
              <div className="p-6">
                {/* Display rawAnalysisText which is the string from the service */}
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{currentAnalysis.summary}</p>
                {/* TODO: Add annotation functionality here based on selected text from summary */}
              </div>
            )}
          </div>

          {/* TODO: The following sections (Key Findings, Risks, etc.) will currently be empty
                      or show default data because `currentAnalysis` is populated with a simple
                      structure. These need to be populated by processing the raw analysis string
                      or by getting structured JSON output from the LLM. */}

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => toggleSection('keyFindings')} className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-600" /> Key Findings ({currentAnalysis.keyFindings.length})</h3>
              {expandedSections.has('keyFindings') ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.has('keyFindings') && currentAnalysis.keyFindings.length > 0 && (
              <div className="p-6"><div className="grid gap-4">
                {currentAnalysis.keyFindings.map((finding, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div><p className="font-medium">{finding.label}</p><p>{finding.value}</p></div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getRiskColor(finding.risk)}`}>{finding.risk}</span>
                  </div>
                ))}
              </div></div>
            )}
          </div>
          {/* ... other sections (Risks, Obligations, Clauses, Metadata) would follow similar pattern ... */}
          {/* For brevity, I'm omitting the detailed rendering of empty sections. You can reinstate them from your original code. */}


          <div className="flex justify-between items-center pt-4">
            <button onClick={() => { setCurrentAnalysis(null); setFiles([]); setCurrentFile(null); setCurrentContractId(null); setRawAnalysisText(null); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Analyze New Contract
            </button>
            {/* ... other action buttons ... */}
          </div>
        </div>
      )}
    </>
  );

  const renderCompareTab = () => ( /* ... Your existing compare tab JSX ... */ );
  const renderHistoryTab = () => ( /* ... Your existing history tab JSX ... */ );
  const renderChatTab = () => ( /* ... Your existing chat tab JSX, ensure it uses currentContractId and potentially fetches contract text ... */ );
  const renderInsightsTab = () => ( /* ... Your existing insights tab JSX ... */ );


  // Main Render
  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" /> AI-Powered Contract Analyzer
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

        <div className="flex border-b border-gray-200 bg-gray-50">
          {(['analyze', 'chat', 'compare', 'history', 'insights'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors flex items-center gap-1.5 ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
              {tab === 'analyze' && <Upload className="h-4 w-4" />}
              {tab === 'chat' && <MessageSquare className="h-4 w-4" />}
              {tab === 'compare' && <GitCompare className="h-4 w-4" />}
              {tab === 'history' && <History className="h-4 w-4" />}
              {tab === 'insights' && <BarChart3 className="h-4 w-4" />}
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 min-h-[400px]"> {/* Added min-h for content area */}
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
        </div>
      </div>

      {activeTab !== 'analyze' && isInitialized && (
        <button onClick={() => { setActiveTab('analyze'); fileInputRef.current?.click();}}
          className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50">
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default ContractRagAnalyzer;
// In ContractRagAnalyzer.tsx

// ... (imports, including actualInitializeContractRAG, addContractFileToRAG)
// Import the new analyzeContractWithRAG that returns a structured object
import {
  analyzeContractWithRAG as actualAnalyzeContractWithRAGStructured, // Renamed for clarity
  TargetJsonStructure // Import the structure type if defined in contractRagService
} from '../../services/contractRagService'; // Adjust path

// ... (AnalysisResult interface and other states)
// Inside ContractRagAnalyzer.tsx -> handleAnalyze
const newUiAnalysis: AnalysisResult = {
  id: newContractId,
  fileName: file.name,
  timestamp: new Date().toISOString(),
  summary: structuredAnalysisResult.executiveSummary || "Summary not available.",
  metadata: {
    contractType: structuredAnalysisResult.documentType || 'N/A',
    // ... other fields from structuredAnalysisResult mapped to AnalysisResult fields ...
  },
  // ... map all other relevant fields ...
  keyFindings: structuredAnalysisResult.keyFindings || [], // Assuming keyFindings exists on TargetJsonStructure
  risks: structuredAnalysisResult.identifiedRisks || [],  // Assuming identifiedRisks maps to risks
  obligations: structuredAnalysisResult.keyObligations || [], // Assuming keyObligations maps to obligations
  clauses: [], // You'll need to prompt for clauses and map them
  score: { overall: 0, risk: 0, compliance: 0, clarity: 0 }, // This likely needs separate calculation or LLM call
  insights: structuredAnalysisResult.recommendations || [], // Example mapping
  recommendations: structuredAnalysisResult.recommendations || [],
};
setCurrentAnalysis(newUiAnalysis);
const handleAnalyze = async (fileToAnalyze?: File) => {
  // ... (file checking, setIsAnalyzing, progress simulation - same as before)
  const file = fileToAnalyze || currentFile;
  // ... (error checks for file and initialization)

  try {
    // ... (fileContent extraction - same as before)

    const newContractId = `contract_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    setCurrentContractId(newContractId);

    await addContractFileToRAG(newContractId, file, { /* ... metadata ... */ });

    let userQuery = "Provide a comprehensive analysis of this contract. ";
    // ... (construct userQuery based on analysisOptions - same as before)

    // **** CALL THE NEW STRUCTURED ANALYSIS FUNCTION ****
    const structuredAnalysisResult: TargetJsonStructure = await actualAnalyzeContractWithRAGStructured(
      fileContent,
      userQuery.trim(),
      {
        targetContractId: newContractId,
        retrieveSimilarContext: true,
        // ... other options
      }
    );

    console.log("Received structured analysis from service:", structuredAnalysisResult);

    // **** MAP TargetJsonStructure to your UI's AnalysisResult ****
    // This mapping depends on how closely TargetJsonStructure matches AnalysisResult
    const newUiAnalysis: AnalysisResult = {
      id: newContractId,
      fileName: file.name,
      timestamp: new Date().toISOString(),
      summary: structuredAnalysisResult.executiveSummary || "Summary not available.",
      metadata: {
        contractType: structuredAnalysisResult.documentType || 'N/A',
        parties: structuredAnalysisResult.partiesInvolved?.map(p => p.name) || [],
        effectiveDate: structuredAnalysisResult.keyDates?.effectiveDate || 'N/A',
        expirationDate: structuredAnalysisResult.keyDates?.expirationDate || 'N/A',
        // ... map other metadata fields
        value: 'N/A', jurisdiction: 'N/A', confidentiality: false, // Defaults
      },
      keyFindings: structuredAnalysisResult.identifiedRisks?.map(r => ({ // Example: mapping risks to keyFindings
          type: 'risk',
          label: `Risk: ${r.description.substring(0,30)}...`,
          value: r.description,
          risk: r.level as 'low' | 'medium' | 'high' // Type assertion
      })) || [],
      risks: structuredAnalysisResult.identifiedRisks?.map(r => ({
          level: r.level,
          description: r.description,
          mitigation: r.mitigation
      })) || [],
      obligations: structuredAnalysisResult.keyObligations?.map(o => ({
          description: o.description,
          responsible: o.responsibleParty,
          dueDate: o.dueDate,
          status: 'pending' // Default status
      })) || [],
      clauses: [], // TODO: Populate if you add clauses to TargetJsonStructure
      score: { overall: 0, risk: 0, compliance: 0, clarity: 0 }, // TODO: Calculate or get from LLM
      insights: structuredAnalysisResult.recommendations || [], // Using recommendations as insights for now
      recommendations: structuredAnalysisResult.recommendations || [],
    };

    setCurrentAnalysis(newUiAnalysis);
    setAnalyses(prev => { /* ... update analyses list ... */ });
    setRawAnalysisText(JSON.stringify(structuredAnalysisResult, null, 2)); // Store raw JSON for debugging/view

  } catch (error) {
    // ... (error handling - same as before)
  } finally {
    // ... (setIsAnalyzing(false), progress - same as before)
  }
};

// The handleChatSubmit function would also use actualAnalyzeContractWithRAGStructured
// and its prompt would need to be adjusted if you want a specific chat-like JSON response,
// or it can continue to get a string response if that's preferred for chat.
// For simplicity, let's assume chat still gets a string for now by calling the *original*
// analyzeContractWithRAG or a similar function that doesn't enforce JSON.
// Or, you can adapt the chat to also expect a simple JSON like { "response": "..." }

// If you want chat to also use the structured analysis:
const handleChatSubmit = async () => {
    // ... (initial checks for chatInput, currentContractId)
    // ... (retrieve contractTextForChat)

    try {
        // Construct a prompt for chat that asks for a focused answer, potentially in simple JSON
        const chatPromptForJson = `
        Based on the following contract text and previous analysis, answer the user's question.
        Return your answer as a JSON object with a single key "chatResponse": "Your answer here".

        Contract Text (or relevant excerpts):
        ${contractTextForChat.substring(0, 15000)} 
        User Question: "${userMessage}"
        `;
        // (This is a simplified chat prompt, you'd integrate RAG context like in analyzeContractWithRAG)

        const result = await getStructuredAnalysisFromGemini(chatPromptForJson); // Using the direct gemini service call

        if (result.success && result.analysis && result.analysis.chatResponse) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: result.analysis.chatResponse }]);
        } else {
            throw new Error(result.error || "Received invalid structured response for chat.");
        }
    } catch (error) {
        // ... (chat error handling)
    } finally {
        // ... (setIsProcessingChat(false))
    }
};
