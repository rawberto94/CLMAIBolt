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

// Mock service functions
const initializeContractRAG = async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return true;
};

const analyzeContractWithRAG = async (content: string, options: any): Promise<AnalysisResult> => {
  await new Promise(resolve => setTimeout(resolve, 3000));
  return {
    id: `analysis-${Date.now()}`,
    summary: "This is a comprehensive Software License Agreement between TechCorp Inc. and ClientCo Ltd., effective from January 1, 2024. The agreement establishes licensing terms for proprietary enterprise software with a 2-year term, automatic renewal clause, and comprehensive support provisions.",
    keyFindings: [
      { type: 'term', label: 'Contract Duration', value: '2 years with auto-renewal', risk: 'low' },
      { type: 'payment', label: 'Payment Terms', value: 'Net 30 days, 2% late fee', risk: 'medium' },
      { type: 'liability', label: 'Liability Cap', value: '12 months of fees', risk: 'high' },
      { type: 'termination', label: 'Termination Clause', value: '90 days notice required', risk: 'medium' },
      { type: 'ip', label: 'IP Rights', value: 'Client retains all data rights', risk: 'low' },
      { type: 'sla', label: 'SLA Guarantee', value: '99.9% uptime', risk: 'medium' }
    ],
    risks: [
      { 
        level: 'high', 
        description: 'Liability cap may be insufficient for enterprise deployment',
        mitigation: 'Consider negotiating increased liability coverage or additional insurance'
      },
      { 
        level: 'medium', 
        description: 'No explicit data breach notification timeline',
        mitigation: 'Add specific breach notification requirements (e.g., 72 hours)'
      },
      {
        level: 'low',
        description: 'Jurisdiction clause may complicate international disputes',
        mitigation: 'Consider adding arbitration clause for faster resolution'
      }
    ],
    obligations: [
      {
        description: 'Monthly usage reporting required by 5th of each month',
        dueDate: '2024-02-05',
        responsible: 'Client',
        status: 'pending'
      },
      {
        description: 'Maintain minimum insurance coverage of $2M',
        responsible: 'Both parties',
        status: 'pending'
      },
      {
        description: 'Annual security audit and compliance certification',
        dueDate: '2024-12-31',
        responsible: 'Vendor',
        status: 'pending'
      },
      {
        description: 'Quarterly business review meetings',
        responsible: 'Both parties',
        status: 'pending'
      }
    ],
    clauses: [
      {
        type: 'indemnification',
        title: 'Mutual Indemnification',
        content: 'Each party shall indemnify and hold harmless the other party...',
        location: 'Section 8.1',
        importance: 'high'
      },
      {
        type: 'confidentiality',
        title: 'Confidentiality and NDA',
        content: 'Both parties agree to maintain strict confidentiality...',
        location: 'Section 6',
        importance: 'high'
      },
      {
        type: 'force-majeure',
        title: 'Force Majeure',
        content: 'Neither party shall be liable for delays due to circumstances beyond reasonable control...',
        location: 'Section 12.3',
        importance: 'medium'
      }
    ],
    metadata: {
      contractType: 'Software License Agreement',
      parties: ['TechCorp Inc.', 'ClientCo Ltd.'],
      effectiveDate: '2024-01-01',
      expirationDate: '2025-12-31',
      value: '$500,000',
      jurisdiction: 'Delaware, USA',
      renewalTerms: 'Automatic renewal unless 90 days notice',
      confidentiality: true
    },
    score: {
      overall: 82,
      risk: 75,
      compliance: 88,
      clarity: 85
    },
    insights: [
      'Contract includes modern SaaS-friendly terms with clear performance metrics',
      'Strong IP protection clauses favor the client',
      'Payment terms are industry-standard but could benefit from early payment discounts',
      'Termination clauses are balanced but require significant notice period'
    ],
    recommendations: [
      'Add specific data residency and privacy compliance clauses (GDPR, CCPA)',
      'Include price protection clause for renewal terms',
      'Define clearer escalation procedures for SLA breaches',
      'Consider adding innovation/roadmap commitment clauses'
    ],
    timestamp: new Date().toISOString(),
    fileName: 'software-license-agreement.pdf'
  };
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return "Sample contract text content...";
};

const compareContracts = async (analyses: AnalysisResult[]): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    similarities: [
      'Both contracts have 2-year terms',
      'Similar payment terms (Net 30)',
      'Comparable limitation of liability clauses'
    ],
    differences: [
      {
        aspect: 'Termination Notice',
        contract1: '30 days',
        contract2: '90 days'
      },
      {
        aspect: 'Auto-renewal',
        contract1: 'No auto-renewal',
        contract2: 'Automatic renewal'
      }
    ],
    recommendations: [
      'Standardize termination notice periods',
      'Align renewal terms across contracts'
    ]
  };
};

const extractClauses = async (content: string, clauseTypes: string[]): Promise<any[]> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return clauseTypes.map(type => ({
    type,
    found: true,
    content: `Sample ${type} clause content...`,
    location: `Section ${Math.floor(Math.random() * 10) + 1}`
  }));
};

const generateInsights = async (analysis: AnalysisResult): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    'Contract risk profile is moderate with manageable exposure',
    'Payment terms align with industry standards',
    'Consider quarterly reviews to ensure compliance',
    'Renewal strategy should be defined 6 months before expiration'
  ];
};

const calculateContractScore = async (analysis: AnalysisResult): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    overall: 82,
    breakdown: {
      clarity: 85,
      completeness: 88,
      riskManagement: 75,
      compliance: 80,
      commercialTerms: 82
    }
  };
};

const matchTemplate = async (content: string, templates: Template[]): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    bestMatch: templates[0],
    confidence: 0.89,
    missingClauses: ['Audit Rights', 'Benchmarking'],
    additionalClauses: ['Custom Development Terms']
  };
};

// Validation and Security Functions
const validateFile = async (file: File): Promise<{ valid: boolean; error?: string }> => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  // Simulate virus scan
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { valid: true };
};

// Main Component
const ContractRagAnalyzer: React.FC = () => {
  // State Management
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
  const [showSettings, setShowSettings] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [analysisOptions, setAnalysisOptions] = useState({
    extractDates: true,
    identifyParties: true,
    assessRisks: true,
    findObligations: true,
    detectClauses: true,
    generateInsights: true,
    calculateScore: true,
    matchTemplates: false,
    deepAnalysis: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    encryptData: true,
    auditLogging: true,
    virusScan: true,
    retentionDays: 90
  });

  // Initialize RAG system
  useEffect(() => {
    const initRAG = async () => {
      try {
        setIsInitializing(true);
        setUploadError(null);
        await initializeContractRAG();
        setIsInitialized(true);
        
        // Load analysis history from localStorage
        const savedAnalyses = localStorage.getItem('contractAnalyses');
        if (savedAnalyses) {
          setAnalyses(JSON.parse(savedAnalyses));
        }
      } catch (error) {
        console.error("Failed to initialize RAG system:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to initialize the knowledge base.";
        
        if (errorMessage.includes('API key')) {
          setUploadError("API key is missing or invalid. Please check your environment configuration.");
        } else {
          setUploadError("Failed to initialize the knowledge base. Please try again later.");
        }
      } finally {
        setIsInitializing(false);
      }
    };
    
    initRAG();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Save analyses to localStorage
  useEffect(() => {
    if (analyses.length > 0) {
      localStorage.setItem('contractAnalyses', JSON.stringify(analyses));
    }
  }, [analyses]);

  // Progress simulation
  const simulateAnalysisProgress = () => {
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + Math.random() * 20, 100);
      });
    }, 500);
  };

  // File handling
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
    
    simulateUpload();
    setUploadError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    if (batchMode) {
      droppedFiles.forEach(handleFile);
    } else {
      handleFile(droppedFiles[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    
    if (batchMode) {
      Array.from(selectedFiles).forEach(handleFile);
    } else {
      handleFile(selectedFiles[0]);
    }
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Analysis functions
  const handleAnalyze = async (fileToAnalyze?: File) => {
    try {
      const file = fileToAnalyze || currentFile;
      if (!file) {
        throw new Error("Please upload a contract file first");
      }

      if (!isInitialized) {
        throw new Error("Analysis system is not ready. Please wait for initialization to complete.");
      }

      setIsAnalyzing(true);
      setUploadError(null);
      simulateAnalysisProgress();
      
      let fileContent: string;
      
      if (file.type === 'application/pdf') {
        try {
          fileContent = await extractTextFromPDF(file);
        } catch (error) {
          throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        fileContent = await readFileAsText(file);
      }
      
      if (!fileContent || fileContent.trim() === '') {
        throw new Error("No text content could be extracted from the file. Please try a different file.");
      }
      
      const result = await analyzeContractWithRAG(fileContent, analysisOptions);
      
      if (!result) {
        throw new Error("Analysis failed to produce a result. Please try again.");
      }
      
      result.fileName = file.name;
      
      setCurrentAnalysis(result);
      setAnalyses(prev => [result, ...prev]);
      
      // Auto-generate insights if enabled
      if (analysisOptions.generateInsights) {
        const insights = await generateInsights(result);
        result.insights = [...result.insights, ...insights];
      }
      
      // Calculate detailed score if enabled
      if (analysisOptions.calculateScore) {
        const detailedScore = await calculateContractScore(result);
        result.score = { ...result.score, ...detailedScore.breakdown };
      }
      
    } catch (error) {
      console.error('Error in handleAnalyze:', error);
      setUploadError(error instanceof Error ? error.message : "An unexpected error occurred while analyzing the contract.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBatchAnalyze = async () => {
    for (const file of files) {
      await handleAnalyze(file);
    }
  };

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

  // UI Functions
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exportAnalysis = (analysis?: AnalysisResult) => {
    const dataToExport = analysis || currentAnalysis;
    if (!dataToExport) return;
    
    const exportData = {
      ...dataToExport,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-analysis-${dataToExport.id}.json`;
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
    const comparison = await compareContracts(analysesToCompare);
    setComparisonResult(comparison);
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !currentAnalysis) return;
    
    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsProcessingChat(true);
    
    // Simulate AI response
    setTimeout(() => {
      const response = `Based on the contract analysis, ${userMessage.toLowerCase().includes('risk') 
        ? 'the main risks are related to the liability cap and data breach notification requirements. I recommend addressing these in your negotiation.'
        : 'I can help you understand specific aspects of this contract. What would you like to know more about?'}`;
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsProcessingChat(false);
    }, 1500);
  };

  const addAnnotation = (section: string, text: string) => {
    const newAnnotation: Annotation = {
      id: `anno-${Date.now()}`,
      text,
      author: 'Current User',
      timestamp: new Date().toISOString(),
      section,
      resolved: false
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
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

  // Render Functions
  const renderAnalysisTab = () => (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Upload Contract</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={batchMode}
              onChange={(e) => setBatchMode(e.target.checked)}
              className="rounded text-blue-600"
            />
            <span className="text-sm text-gray-600">Batch Mode</span>
          </label>
        </div>
        
        <div className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-all ${!isInitialized ? 'opacity-50' : 'hover:border-blue-400'}`}>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            multiple={batchMode}
            onChange={handleFileInput}
            disabled={!isInitialized}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => e.preventDefault()}
            className={`${isInitialized ? 'cursor-pointer' : 'cursor-not-allowed'}`}
          >
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
                    {batchMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFiles(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-lg font-medium text-gray-700">
                  {batchMode ? 'Upload multiple contracts' : 'Upload your contract'}
                </p>
                <p className="text-sm text-gray-500">
                  Drag and drop or click to select {batchMode ? 'files' : 'a file'}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supported: PDF, DOC, DOCX, TXT (Max 10MB each)
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Analysis Options</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(analysisOptions).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setAnalysisOptions(prev => ({
                    ...prev,
                    [key]: e.target.checked
                  }))}
                  className="rounded text-blue-600"
                />
                <span className="text-gray-600">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center gap-3">
        <button
          onClick={() => batchMode ? handleBatchAnalyze() : handleAnalyze()}
          disabled={files.length === 0 || isAnalyzing || !isInitialized}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all
            ${(files.length === 0 || isAnalyzing || !isInitialized)
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
            }
          `}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              {batchMode ? `Analyze ${files.length} Contracts` : 'Analyze Contract'}
            </>
          )}
        </button>
        
        {currentAnalysis && (
          <button
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-2 px-6 py-3 rounded-md font-medium bg-purple-600 text-white hover:bg-purple-700"
          >
            <MessageSquare className="h-5 w-5" />
            Ask Questions
          </button>
        )}
      </div>

      {isAnalyzing && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Analyzing contract... {Math.round(analysisProgress)}%
          </p>
        </div>
      )}

      {currentAnalysis && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Analysis Results</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportAnalysis()}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Contract Score Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(currentAnalysis.score.overall)}`}>
                  {currentAnalysis.score.overall}
                </div>
                <p className="text-sm text-gray-600">Overall Score</p>
              </div>
              {Object.entries(currentAnalysis.score).filter(([key]) => key !== 'overall').map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className={`text-2xl font-semibold ${getScoreColor(value as number)}`}>
                    {value}
                  </div>
                  <p className="text-sm text-gray-600 capitalize">{key}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Sections */}
          <div className="space-y-4">
            {/* Summary Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('summary')}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-blue-600" />
                  Executive Summary
                </h3>
                {expandedSections.has('summary') ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections.has('summary') && (
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed">{currentAnalysis.summary}</p>
                  {showAnnotations && (
                    <button
                      onClick={() => addAnnotation('summary', 'Add note...')}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Annotation
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Key Findings Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('keyFindings')}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Key Findings ({currentAnalysis.keyFindings.length})
                </h3>
                {expandedSections.has('keyFindings') ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections.has('keyFindings') && (
                <div className="p-6">
                  <div className="grid gap-4">
                    {currentAnalysis.keyFindings.map((finding, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-gray-700">{finding.label}</p>
                          <p className="text-gray-600">{finding.value}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(finding.risk)}`}>
                          {finding.risk.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Risks Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('risks')}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Risk Assessment ({currentAnalysis.risks.length})
                </h3>
                {expandedSections.has('risks') ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections.has('risks') && (
                <div className="p-6">
                  <div className="space-y-3">
                    {currentAnalysis.risks.map((risk, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getRiskColor(risk.level)}`}>
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">{risk.level.toUpperCase()} RISK</p>
                            <p className="text-sm mt-1">{risk.description}</p>
                            {risk.mitigation && (
                              <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
                                <p className="text-sm font-medium">Mitigation:</p>
                                <p className="text-sm">{risk.mitigation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Obligations Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('obligations')}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Contractual Obligations ({currentAnalysis.obligations.length})
                </h3>
                {expandedSections.has('obligations') ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections.has('obligations') && (
                <div className="p-6">
                  <div className="space-y-3">
                    {currentAnalysis.obligations.map((obligation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-gray-700">{obligation.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            {obligation.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(obligation.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            {obligation.responsible && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {obligation.responsible}
                              </span>
                            )}
                            {obligation.status && (
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                obligation.status === 'completed' ? 'bg-green-100 text-green-700' :
                                obligation.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {obligation.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clauses Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('clauses')}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-green-600" />
                  Key Clauses ({currentAnalysis.clauses.length})
                </h3>
                {expandedSections.has('clauses') ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections.has('clauses') && (
                <div className="p-6">
                  <div className="space-y-3">
                    {currentAnalysis.clauses.map((clause, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{clause.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">{clause.location}</p>
                            <p className="text-sm text-gray-600 mt-2">{clause.content}</p>
                          </div>
                          <span className={`ml-3 px-2 py-1 text-xs rounded ${
                            clause.importance === 'high' ? 'bg-red-100 text-red-700' :
                            clause.importance === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {clause.importance}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metadata Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('metadata')}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <h3 className="text-lg font-semibold">Contract Details</h3>
                {expandedSections.has('metadata') ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections.has('metadata') && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(currentAnalysis.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          {key === 'contractType' && <FileText className="h-4 w-4" />}
                          {key === 'parties' && <Users className="h-4 w-4" />}
                          {key === 'effectiveDate' && <Calendar className="h-4 w-4" />}
                          {key === 'value' && <DollarSign className="h-4 w-4" />}
                          {key === 'jurisdiction' && <MapPin className="h-4 w-4" />}
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-800">
                            {Array.isArray(value) ? value.join(', ') : 
                             typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                          </span>
                          <button
                            onClick={() => copyToClipboard(
                              Array.isArray(value) ? value.join(', ') : String(value), 
                              key
                            )}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {copiedField === key ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Insights & Recommendations */}
            {(currentAnalysis.insights.length > 0 || currentAnalysis.recommendations.length > 0) && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('insights')}
                  className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                >
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    Insights & Recommendations
                  </h3>
                  {expandedSections.has('insights') ? <ChevronUp /> : <ChevronDown />}
                </button>
                {expandedSections.has('insights') && (
                  <div className="p-6 space-y-4">
                    {currentAnalysis.insights.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Key Insights</h4>
                        <ul className="space-y-2">
                          {currentAnalysis.insights.map((insight, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-indigo-600 mt-1">•</span>
                              <span className="text-gray-600">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {currentAnalysis.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Recommendations</h4>
                        <ul className="space-y-2">
                          {currentAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-600 mt-1">✓</span>
                              <span className="text-gray-600">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => {
                setCurrentAnalysis(null);
                setFiles([]);
                setCurrentFile(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Analyze New Contract
            </button>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                <Plus className="h-4 w-4" />
                Create Task
              </button>
              <button
                onClick={() => setActiveTab('compare')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                <GitCompare className="h-4 w-4" />
                Compare Contracts
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderCompareTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Compare Contracts</h3>
      
      {analyses.length < 2 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <GitCompare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">You need at least 2 analyzed contracts to compare.</p>
          <button
            onClick={() => setActiveTab('analyze')}
            className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Analyze Contracts
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyses.map((analysis) => (
              <label key={analysis.id} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAnalyses.includes(analysis.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAnalyses(prev => [...prev, analysis.id]);
                    } else {
                      setSelectedAnalyses(prev => prev.filter(id => id !== analysis.id));
                    }
                  }}
                  className="mt-1 rounded text-blue-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{analysis.fileName}</p>
                  <p className="text-sm text-gray-600">{analysis.metadata.contractType}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Analyzed: {new Date(analysis.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleCompareContracts}
            disabled={selectedAnalyses.length < 2}
            className={`px-6 py-3 rounded-md font-medium ${
              selectedAnalyses.length < 2
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Compare Selected ({selectedAnalyses.length})
          </button>

          {comparisonResult && (
            <div className="space-y-6 mt-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Similarities</h4>
                <ul className="space-y-2">
                  {comparisonResult.similarities.map((sim: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">{sim}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-3">Differences</h4>
                <div className="space-y-3">
                  {comparisonResult.differences.map((diff: any, index: number) => (
                    <div key={index} className="grid grid-cols-3 gap-4 p-3 bg-white rounded">
                      <div className="font-medium text-gray-700">{diff.aspect}</div>
                      <div className="text-gray-600">{diff.contract1}</div>
                      <div className="text-gray-600">{diff.contract2}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {comparisonResult.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analysis History</h3>
        <button
          onClick={() => {
            if (confirm('Clear all analysis history?')) {
              setAnalyses([]);
              localStorage.removeItem('contractAnalyses');
            }
          }}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Clear History
        </button>
      </div>

      {analyses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <History className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No analysis history yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <div key={analysis.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{analysis.fileName}</h4>
                  <p className="text-sm text-gray-600">{analysis.metadata.contractType}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{new Date(analysis.timestamp).toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded ${getScoreColor(analysis.score.overall)} bg-opacity-10`}>
                      Score: {analysis.score.overall}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentAnalysis(analysis)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>
                  <button
                    onClick={() => exportAnalysis(analysis)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Export
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderChatTab = () => (
    <div className="flex flex-col h-[600px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Contract Assistant</h3>
        {currentAnalysis && (
          <span className="text-sm text-gray-600">
            Discussing: {currentAnalysis.fileName}
          </span>
        )}
      </div>

      {!currentAnalysis ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Analyze a contract first to start asking questions.</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>Ask me anything about the contract!</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {['What are the main risks?', 'Summarize payment terms', 'Is this contract balanced?'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setChatInput(suggestion)}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {chatMessages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isProcessingChat && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
              placeholder="Ask about the contract..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleChatSubmit}
              disabled={!chatInput.trim() || isProcessingChat}
              className={`px-4 py-2 rounded-lg ${
                !chatInput.trim() || isProcessingChat
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Contract Intelligence Dashboard</h3>
      
      {analyses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No data available. Analyze contracts to see insights.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Total Contracts</h4>
            <p className="text-3xl font-bold text-blue-900">{analyses.length}</p>
            <p className="text-sm text-blue-600 mt-1">Analyzed to date</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Average Score</h4>
            <p className="text-3xl font-bold text-green-900">
              {Math.round(analyses.reduce((acc, a) => acc + a.score.overall, 0) / analyses.length)}
            </p>
            <p className="text-sm text-green-600 mt-1">Overall contract quality</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Risk Distribution</h4>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-sm">
                <span>High Risk</span>
                <span className="font-medium">
                  {analyses.filter(a => a.risks.some(r => r.level === 'high')).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Medium Risk</span>
                <span className="font-medium">
                  {analyses.filter(a => a.risks.some(r => r.level === 'medium')).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Low Risk</span>
                <span className="font-medium">
                  {analyses.filter(a => a.risks.some(r => r.level === 'low')).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Contract Types</h4>
            <div className="space-y-1 mt-2">
              {[...new Set(analyses.map(a => a.metadata.contractType))].map((type) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="truncate">{type}</span>
                  <span className="font-medium">
                    {analyses.filter(a => a.metadata.contractType === type).length}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg">
            <h4 className="font-semibold text-indigo-800 mb-2">Total Value</h4>
            <p className="text-2xl font-bold text-indigo-900">
              ${analyses.reduce((acc, a) => {
                const value = parseInt(a.metadata.value.replace(/[^0-9]/g, '')) || 0;
                return acc + value;
              }, 0).toLocaleString()}
            </p>
            <p className="text-sm text-indigo-600 mt-1">Across all contracts</p>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg">
            <h4 className="font-semibold text-pink-800 mb-2">Upcoming Obligations</h4>
            <p className="text-3xl font-bold text-pink-900">
              {analyses.reduce((acc, a) => 
                acc + a.obligations.filter(o => o.status === 'pending').length, 0
              )}
            </p>
            <p className="text-sm text-pink-600 mt-1">Action items pending</p>
          </div>
        </div>
      )}

      {analyses.length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="font-semibold mb-4">Recent Trends</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Average contract duration</span>
                <span className="font-medium">2.3 years</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Most common jurisdiction</span>
                <span className="font-medium">Delaware, USA</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Auto-renewal rate</span>
                <span className="font-medium">65%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="font-semibold mb-4">AI Recommendations</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 mt-0.5" />
                <span className="text-gray-700">Consider standardizing termination notice periods across contracts</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 mt-0.5" />
                <span className="text-gray-700">Review liability caps - 35% are below industry standards</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 mt-0.5" />
                <span className="text-gray-700">Add explicit data breach notification clauses to older contracts</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  // Main Render
  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              AI-Powered Contract Analyzer
            </h2>
            <div className="flex items-center gap-3">
              {isInitialized && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  System Ready
                </span>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium mb-4">Security & Privacy Settings</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(securitySettings).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      [key]: key === 'retentionDays' ? prev.retentionDays : e.target.checked
                    }))}
                    className="rounded text-blue-600"
                    disabled={key === 'retentionDays'}
                  />
                  <span className="text-gray-600">
                    {key === 'retentionDays' ? `${value} days retention` : 
                     key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          {(['analyze', 'compare', 'history', 'chat', 'insights'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'analyze' && <Upload className="inline h-4 w-4 mr-1" />}
              {tab === 'compare' && <GitCompare className="inline h-4 w-4 mr-1" />}
              {tab === 'history' && <History className="inline h-4 w-4 mr-1" />}
              {tab === 'chat' && <MessageSquare className="inline h-4 w-4 mr-1" />}
              {tab === 'insights' && <BarChart3 className="inline h-4 w-4 mr-1" />}
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {isInitializing && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2 text-blue-700 animate-pulse">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <p>Initializing AI analysis system...</p>
            </div>
          )}

          {uploadError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{uploadError}</p>
              </div>
              <button onClick={() => setUploadError(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'analyze' && renderAnalysisTab()}
          {activeTab === 'compare' && renderCompareTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'chat' && renderChatTab()}
          {activeTab === 'insights' && renderInsightsTab()}
        </div>
      </div>

      {/* Floating Action Button for Quick Upload */}
      {activeTab !== 'analyze' && isInitialized && (
        <button
          onClick={() => {
            setActiveTab('analyze');
            fileInputRef.current?.click();
          }}
          className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default ContractRagAnalyzer; => setShowAnnotations(!showAnnotations)}
                className={`px-3 py-1 text-sm rounded-md ${showAnnotations ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                {showAnnotations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span className="ml-1">Annotations</span>
              </button>
              <button
                onClick={()
