import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Zap, 
  CheckCircle, 
  X, 
  RefreshCw, 
  AlertTriangle, 
  Download,
  DollarSign,
  Calendar,
  Scale,
  Shield,
  AlertCircle,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileSpreadsheet,
  Info
} from 'lucide-react';

// Demo contract analysis component
const ContractAnalysisDemo: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    financials: true,
    obligations: true,
    risks: true,
    compliance: true,
    recommendations: true
  });
  const [showDemoNotice, setShowDemoNotice] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const handleFile = (file: File) => {
    setFile(file);
    simulateUpload();
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setUploadError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock analysis result
      const mockResult = generateMockAnalysis(file.name);
      setAnalysisResult(mockResult);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Error analyzing contract:', error);
      setUploadError('An error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMockAnalysis = (fileName: string) => {
    // Mock data for demonstration purposes
    return {
      overview: {
        title: fileName || "Sample Master Service Agreement",
        type: "Master Service Agreement",
        status: "Active",
        parties: ["Acme Corporation (Client)", "Tech Solutions Inc. (Vendor)"],
        effectiveDate: "2025-01-01",
        expirationDate: "2027-12-31",
        totalValue: "$1,250,000",
        description: "This Master Service Agreement (MSA) establishes the terms and conditions under which Tech Solutions Inc. will provide IT consulting and implementation services to Acme Corporation over a 3-year period."
      },
      financials: {
        totalValue: 1250000,
        currency: "USD",
        paymentTerms: {
          schedule: "Monthly",
          terms: "Net 45",
          latePaymentFee: "1.5% monthly",
          earlyPaymentDiscount: "2% if paid within 15 days"
        },
        rateCards: [
          { role: "Senior Developer", rate: 150, unit: "hourly" },
          { role: "Project Manager", rate: 175, unit: "hourly" },
          { role: "Business Analyst", rate: 125, unit: "hourly" },
          { role: "QA Engineer", rate: 110, unit: "hourly" },
          { role: "DevOps Engineer", rate: 160, unit: "hourly" }
        ],
        fees: [
          { type: "Travel Expenses", description: "Billed at cost", cap: "Not to exceed 15% of monthly fees" },
          { type: "Software Licenses", description: "Pass-through", cap: "As approved by client" }
        ],
        invoicingFrequency: "Monthly",
        budgetAllocation: {
          year1: 400000,
          year2: 425000,
          year3: 425000
        },
        benchmarkComparison: {
          averageRates: {
            industry: 145,
            ourAnalysis: 144,
            variance: -0.7
          },
          paymentTerms: {
            industry: "Net 30",
            ourAnalysis: "Net 45",
            variance: "+15 days"
          }
        }
      },
      obligations: {
        deliverables: [
          { description: "Initial Assessment Report", deadline: "30 days after effective date", status: "At Risk" },
          { description: "Phase 1 Implementation", deadline: "Q2 2025", status: "On Track" },
          { description: "Phase 2 Implementation", deadline: "Q4 2025", status: "On Track" },
          { description: "Final System Deployment", deadline: "Q2 2026", status: "On Track" }
        ],
        serviceLevel: {
          availability: "99.9% during business hours",
          responseTime: {
            critical: "1 hour",
            high: "4 hours",
            medium: "8 hours",
            low: "24 hours"
          },
          penalties: "2% service credit for each 0.1% below availability target"
        },
        reporting: {
          frequency: "Monthly",
          contents: ["Service level performance", "Project status", "Budget utilization", "Issues and risks"]
        },
        keyPersonnel: [
          { role: "Project Manager", replaceability: "With client approval" },
          { role: "Solution Architect", replaceability: "With client approval" }
        ]
      },
      risks: [
        { 
          category: "Financial", 
          description: "Payment terms (Net 45) exceed industry standard (Net 30)", 
          severity: "Medium", 
          impact: "Potential cash flow issues",
          mitigation: "Monitor accounts receivable closely; consider renegotiation at renewal"
        },
        { 
          category: "Delivery", 
          description: "Initial assessment deadline appears aggressive", 
          severity: "High", 
          impact: "Potential delay in project kickoff",
          mitigation: "Allocate additional resources to meet deadline or request extension"
        },
        { 
          category: "Legal", 
          description: "Limitation of liability cap is 12 months of fees", 
          severity: "Medium", 
          impact: "Exposure to damages exceeding cap",
          mitigation: "Review insurance coverage; consider negotiating higher cap"
        },
        { 
          category: "Compliance", 
          description: "Data protection provisions may not fully address GDPR requirements", 
          severity: "High", 
          impact: "Potential regulatory non-compliance",
          mitigation: "Immediate review by privacy counsel; possible amendment required"
        }
      ],
      compliance: {
        score: 78,
        requirements: [
          { category: "Data Protection", status: "Partial", details: "GDPR provisions incomplete" },
          { category: "Intellectual Property", status: "Compliant", details: "Clear ownership provisions" },
          { category: "Insurance", status: "Compliant", details: "Meets minimum requirements" },
          { category: "Termination", status: "Compliant", details: "Standard termination clauses" },
          { category: "Confidentiality", status: "Compliant", details: "Strong confidentiality provisions" },
          { category: "Dispute Resolution", status: "Compliant", details: "Clear escalation and resolution process" }
        ],
        industryRegulations: [
          { name: "GDPR", status: "At Risk", details: "Missing specific data subject rights provisions" },
          { name: "SOC 2", status: "Compliant", details: "Security controls adequately addressed" }
        ]
      },
      recommendations: [
        { 
          priority: "High", 
          description: "Amend data protection provisions to fully address GDPR requirements",
          benefit: "Mitigate compliance risk and potential regulatory penalties",
          effort: "Medium"
        },
        { 
          priority: "Medium", 
          description: "Renegotiate payment terms to Net 30",
          benefit: "Improve cash flow and align with industry standards",
          effort: "Low"
        },
        { 
          priority: "Medium", 
          description: "Increase limitation of liability cap to 24 months of fees",
          benefit: "Better protection against potential damages",
          effort: "Medium"
        },
        { 
          priority: "Low", 
          description: "Add specific KPIs for measuring project success",
          benefit: "Improved performance tracking and accountability",
          effort: "Low"
        }
      ],
      benchmarks: {
        rateComparison: {
          averageRate: 144,
          marketAverage: 145,
          percentile: 48
        },
        termComparison: {
          paymentTerms: {
            contract: "Net 45",
            marketAverage: "Net 30",
            status: "Above Average (Unfavorable)"
          },
          contractLength: {
            contract: "36 months",
            marketAverage: "24 months",
            status: "Above Average (Favorable)"
          },
          terminationNotice: {
            contract: "60 days",
            marketAverage: "45 days",
            status: "Above Average (Favorable)"
          }
        }
      }
    };
  };

  const handleExportAnalysis = () => {
    if (!analysisResult) return;
    
    // In a real implementation, this would generate a PDF or Excel report
    // For demo purposes, we'll just create a JSON file
    const dataStr = JSON.stringify(analysisResult, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = 'contract_analysis_report.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleLoadSampleContract = async () => {
    setFile(new File(["Sample Contract Content"], "Sample_MSA_2025.pdf", { type: "application/pdf" }));
    setUploadProgress(100);
    
    // Automatically trigger analysis after a short delay
    setTimeout(() => {
      handleAnalyze();
    }, 500);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'compliant':
        return 'text-green-600 bg-green-50';
      case 'partial':
        return 'text-yellow-600 bg-yellow-50';
      case 'non-compliant':
      case 'at risk':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const renderRateComparisonChart = () => {
    if (!analysisResult) return null;
    
    const { rateCards } = analysisResult.financials;
    const { benchmarks } = analysisResult;
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Rate Comparison</h4>
        <div className="relative pt-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block text-primary-600">
                Contract Average: ${benchmarks.rateComparison.averageRate}/hr
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold inline-block text-gray-600">
                Market Average: ${benchmarks.rateComparison.marketAverage}/hr
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 mt-1">
            <div 
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500`}
              style={{ width: `${benchmarks.rateComparison.percentile}%` }}
            ></div>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-white border-2 border-primary-500" style={{ left: `${benchmarks.rateComparison.percentile}%` }}></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Lower than market</span>
            <span>Market average</span>
            <span>Higher than market</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="h-6 w-6 mr-2 text-primary-600" />
            Contract Analysis Demo
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Analyze contracts to extract key information, identify risks, and ensure compliance
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleLoadSampleContract}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            Load Sample Contract
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Contract
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileInput}
          />
        </div>
      </div>

      {showDemoNotice && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 relative">
          <div className="flex">
            <Info className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <span className="font-bold">DEMO MODE</span>: This is a demonstration version of the contract analysis system. All data shown is sample data and does not represent actual contracts or analysis.
              </p>
            </div>
          </div>
          <button 
            className="absolute top-2 right-2 text-blue-400 hover:text-blue-600"
            onClick={() => setShowDemoNotice(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {uploadError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          </div>
        </div>
      )}

      {!file ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload a contract to analyze</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Upload a contract document to extract key information, identify risks, and ensure compliance with regulations and best practices.
          </p>
          <div 
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-primary-500 transition-colors duration-200 max-w-md mx-auto"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileInput}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, or TXT up to 10MB
              </p>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={handleLoadSampleContract}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FileText className="h-4 w-4 mr-2" />
              Load Sample Contract
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-gray-900">{file.name}</h3>
              <p className="text-sm text-gray-500">{file.type || 'application/pdf'} • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              {uploadProgress < 100 ? (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              ) : (
                <div className="flex items-center mt-2 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Upload complete
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => {
                  setFile(null);
                  setAnalysisComplete(false);
                  setAnalysisResult(null);
                  setUploadProgress(0);
                }}
                className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!analysisComplete ? (
            <div className="flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || uploadProgress < 100}
                className={`
                  flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white
                  ${isAnalyzing || uploadProgress < 100
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                  }
                `}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing Contract...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Analyze Contract
                  </>
                )}
              </button>
            </div>
          ) : analysisResult ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Analysis Results</h3>
                <button
                  onClick={handleExportAnalysis}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Analysis
                </button>
              </div>

              {/* Overview Section */}
              <div className="border rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('overview')}
                >
                  <h4 className="text-base font-medium text-gray-900">Contract Overview</h4>
                  {expandedSections.overview ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                {expandedSections.overview && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Contract Details</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Type:</span>
                            <span className="text-sm font-medium text-gray-900">{analysisResult.overview.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Status:</span>
                            <span className="text-sm font-medium text-gray-900">{analysisResult.overview.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Effective Date:</span>
                            <span className="text-sm font-medium text-gray-900">{analysisResult.overview.effectiveDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Expiration Date:</span>
                            <span className="text-sm font-medium text-gray-900">{analysisResult.overview.expirationDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Total Value:</span>
                            <span className="text-sm font-medium text-gray-900">{analysisResult.overview.totalValue}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Parties</h5>
                        <ul className="space-y-1">
                          {analysisResult.overview.parties.map((party: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600">{party}</li>
                          ))}
                        </ul>
                        <h5 className="text-sm font-medium text-gray-700 mt-4 mb-2">Description</h5>
                        <p className="text-sm text-gray-600">{analysisResult.overview.description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Financials Section */}
              <div className="border rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('financials')}
                >
                  <h4 className="text-base font-medium text-gray-900 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-primary-600" />
                    Financial Analysis
                  </h4>
                  {expandedSections.financials ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                {expandedSections.financials && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Payment Terms</h5>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Schedule:</span>
                              <span className="text-sm font-medium text-gray-900">{analysisResult.financials.paymentTerms.schedule}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Terms:</span>
                              <span className="text-sm font-medium text-gray-900">{analysisResult.financials.paymentTerms.terms}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Late Payment Fee:</span>
                              <span className="text-sm font-medium text-gray-900">{analysisResult.financials.paymentTerms.latePaymentFee}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Early Payment Discount:</span>
                              <span className="text-sm font-medium text-gray-900">{analysisResult.financials.paymentTerms.earlyPaymentDiscount}</span>
                            </div>
                          </div>
                        </div>

                        <h5 className="text-sm font-medium text-gray-700 mt-4 mb-3">Budget Allocation</h5>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Year 1:</span>
                                <span className="font-medium text-gray-900">${analysisResult.financials.budgetAllocation.year1.toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary-600 h-2 rounded-full" 
                                  style={{ width: `${(analysisResult.financials.budgetAllocation.year1 / analysisResult.financials.totalValue) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Year 2:</span>
                                <span className="font-medium text-gray-900">${analysisResult.financials.budgetAllocation.year2.toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary-600 h-2 rounded-full" 
                                  style={{ width: `${(analysisResult.financials.budgetAllocation.year2 / analysisResult.financials.totalValue) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Year 3:</span>
                                <span className="font-medium text-gray-900">${analysisResult.financials.budgetAllocation.year3.toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary-600 h-2 rounded-full" 
                                  style={{ width: `${(analysisResult.financials.budgetAllocation.year3 / analysisResult.financials.totalValue) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Rate Card</h5>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {analysisResult.financials.rateCards.map((rate: any, index: number) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{rate.role}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${rate.rate}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rate.unit}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <h5 className="text-sm font-medium text-gray-700 mt-4 mb-3">Additional Fees</h5>
                        <div className="space-y-2">
                          {analysisResult.financials.fees.map((fee: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-700">{fee.type}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{fee.description}</p>
                              {fee.cap && (
                                <p className="text-xs text-gray-500 mt-1">Cap: {fee.cap}</p>
                              )}
                            </div>
                          ))}
                        </div>

                        {renderRateComparisonChart()}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Obligations Section */}
              <div className="border rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('obligations')}
                >
                  <h4 className="text-base font-medium text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary-600" />
                    Deliverables & Obligations
                  </h4>
                  {expandedSections.obligations ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                {expandedSections.obligations && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Key Deliverables</h5>
                        <div className="space-y-3">
                          {analysisResult.obligations.deliverables.map((deliverable: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-sm font-medium text-gray-700">{deliverable.description}</span>
                                  <p className="text-xs text-gray-500 mt-1">Deadline: {deliverable.deadline}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  deliverable.status === 'On Track' ? 'bg-green-100 text-green-800' :
                                  deliverable.status === 'At Risk' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {deliverable.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <h5 className="text-sm font-medium text-gray-700 mt-4 mb-3">Key Personnel</h5>
                        <div className="space-y-2">
                          {analysisResult.obligations.keyPersonnel.map((person: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-700">{person.role}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Replaceability: {person.replaceability}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Service Level Agreement</h5>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-700">Availability:</span>
                              <p className="text-sm text-gray-600 mt-1">{analysisResult.obligations.serviceLevel.availability}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700">Response Times:</span>
                              <div className="ml-2 mt-1 space-y-1">
                                <p className="text-sm text-gray-600">Critical: {analysisResult.obligations.serviceLevel.responseTime.critical}</p>
                                <p className="text-sm text-gray-600">High: {analysisResult.obligations.serviceLevel.responseTime.high}</p>
                                <p className="text-sm text-gray-600">Medium: {analysisResult.obligations.serviceLevel.responseTime.medium}</p>
                                <p className="text-sm text-gray-600">Low: {analysisResult.obligations.serviceLevel.responseTime.low}</p>
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700">Penalties:</span>
                              <p className="text-sm text-gray-600 mt-1">{analysisResult.obligations.serviceLevel.penalties}</p>
                            </div>
                          </div>
                        </div>

                        <h5 className="text-sm font-medium text-gray-700 mt-4 mb-3">Reporting Requirements</h5>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Frequency:</span>
                              <span className="text-sm font-medium text-gray-900">{analysisResult.obligations.reporting.frequency}</span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Contents:</span>
                              <ul className="list-disc list-inside mt-1">
                                {analysisResult.obligations.reporting.contents.map((item: string, index: number) => (
                                  <li key={index} className="text-sm text-gray-600">{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Risks Section */}
              <div className="border rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('risks')}
                >
                  <h4 className="text-base font-medium text-gray-900 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-primary-600" />
                    Risk Analysis
                  </h4>
                  {expandedSections.risks ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                {expandedSections.risks && (
                  <div className="p-4">
                    <div className="space-y-4">
                      {analysisResult.risks.map((risk: any, index: number) => (
                        <div key={index} className={`border p-4 rounded-lg ${getSeverityColor(risk.severity)}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <span className="text-sm font-medium">{risk.category}</span>
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  risk.severity === 'High' ? 'bg-red-100 text-red-800' :
                                  risk.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {risk.severity}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{risk.description}</p>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <span className="text-xs font-medium">Impact:</span>
                                <p className="text-xs mt-0.5">{risk.impact}</p>
                              </div>
                              <div>
                                <span className="text-xs font-medium">Mitigation:</span>
                                <p className="text-xs mt-0.5">{risk.mitigation}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Compliance Section */}
              <div className="border rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('compliance')}
                >
                  <h4 className="text-base font-medium text-gray-900 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-primary-600" />
                    Compliance Analysis
                  </h4>
                  {expandedSections.compliance ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                {expandedSections.compliance && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="inline-flex items-center justify-center p-4 bg-white rounded-full mb-3 shadow-sm">
                            <div className="relative h-16 w-16">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary-600">{analysisResult.compliance.score}</span>
                              </div>
                              {/* Circular progress indicator */}
                              <svg className="w-16 h-16" viewBox="0 0 36 36">
                                <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#E5E7EB"
                                  strokeWidth="3"
                                  strokeDasharray="100, 100"
                                />
                                <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke={analysisResult.compliance.score >= 80 ? "#10B981" : 
                                          analysisResult.compliance.score >= 60 ? "#F59E0B" : "#EF4444"}
                                  strokeWidth="3"
                                  strokeDasharray={`${analysisResult.compliance.score}, 100`}
                                />
                              </svg>
                            </div>
                          </div>
                          <h5 className="text-lg font-semibold text-gray-900">Compliance Score</h5>
                          <p className="text-sm text-gray-500 mt-1">
                            {analysisResult.compliance.score >= 80 ? "Good compliance" : 
                             analysisResult.compliance.score >= 60 ? "Needs improvement" : "Critical issues"}
                          </p>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Compliance Requirements</h5>
                        <div className="space-y-2">
                          {analysisResult.compliance.requirements.map((req: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <span className="text-sm font-medium text-gray-700">{req.category}</span>
                                <p className="text-xs text-gray-500 mt-0.5">{req.details}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(req.status)}`}>
                                {req.status}
                              </span>
                            </div>
                          ))}
                        </div>

                        <h5 className="text-sm font-medium text-gray-700 mt-4 mb-3">Industry Regulations</h5>
                        <div className="space-y-2">
                          {analysisResult.compliance.industryRegulations.map((reg: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <span className="text-sm font-medium text-gray-700">{reg.name}</span>
                                <p className="text-xs text-gray-500 mt-0.5">{reg.details}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reg.status)}`}>
                                {reg.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations Section */}
              <div className="border rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('recommendations')}
                >
                  <h4 className="text-base font-medium text-gray-900 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
                    Recommendations
                  </h4>
                  {expandedSections.recommendations ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                {expandedSections.recommendations && (
                  <div className="p-4">
                    <div className="space-y-4">
                      {analysisResult.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="border p-4 rounded-lg">
                          <div className="flex items-start">
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                              rec.priority === 'High' ? 'bg-red-100' :
                              rec.priority === 'Medium' ? 'bg-yellow-100' :
                              'bg-green-100'
                            }`}>
                              <span className={`text-xs font-medium ${
                                rec.priority === 'High' ? 'text-red-800' :
                                rec.priority === 'Medium' ? 'text-yellow-800' :
                                'text-green-800'
                              }`}>
                                {rec.priority.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-900">{rec.description}</span>
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                                  rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {rec.priority} Priority
                                </span>
                              </div>
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <span className="text-xs font-medium text-gray-500">Benefit:</span>
                                  <p className="text-sm text-gray-600">{rec.benefit}</p>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-500">Implementation Effort:</span>
                                  <p className="text-sm text-gray-600">{rec.effort}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Benchmark Comparison */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3">
                  <h4 className="text-base font-medium text-gray-900 flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-primary-600" />
                    Benchmark Comparison
                  </h4>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Rate Comparison</h5>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">Average Rate:</span>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">${analysisResult.benchmarks.rateComparison.averageRate}/hr</span>
                            <span className={`ml-2 text-xs ${
                              analysisResult.benchmarks.rateComparison.averageRate < analysisResult.benchmarks.rateComparison.marketAverage ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {analysisResult.benchmarks.rateComparison.averageRate < analysisResult.benchmarks.rateComparison.marketAverage ? '↓' : '↑'}
                              {Math.abs(((analysisResult.benchmarks.rateComparison.averageRate / analysisResult.benchmarks.rateComparison.marketAverage) - 1) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">Market Average:</span>
                          <span className="text-sm font-medium text-gray-900">${analysisResult.benchmarks.rateComparison.marketAverage}/hr</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Percentile:</span>
                          <span className="text-sm font-medium text-gray-900">{analysisResult.benchmarks.rateComparison.percentile}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Term Comparison</h5>
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Payment Terms</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              analysisResult.benchmarks.termComparison.paymentTerms.status.includes('Unfavorable') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {analysisResult.benchmarks.termComparison.paymentTerms.status}
                            </span>
                          </div>
                          <div className="mt-1 grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-xs text-gray-500">Contract:</span>
                              <p className="text-sm text-gray-900">{analysisResult.benchmarks.termComparison.paymentTerms.contract}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Market Average:</span>
                              <p className="text-sm text-gray-900">{analysisResult.benchmarks.termComparison.paymentTerms.marketAverage}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Contract Length</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              analysisResult.benchmarks.termComparison.contractLength.status.includes('Favorable') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {analysisResult.benchmarks.termComparison.contractLength.status}
                            </span>
                          </div>
                          <div className="mt-1 grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-xs text-gray-500">Contract:</span>
                              <p className="text-sm text-gray-900">{analysisResult.benchmarks.termComparison.contractLength.contract}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Market Average:</span>
                              <p className="text-sm text-gray-900">{analysisResult.benchmarks.termComparison.contractLength.marketAverage}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Termination Notice</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              analysisResult.benchmarks.termComparison.terminationNotice.status.includes('Favorable') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {analysisResult.benchmarks.termComparison.terminationNotice.status}
                            </span>
                          </div>
                          <div className="mt-1 grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-xs text-gray-500">Contract:</span>
                              <p className="text-sm text-gray-900">{analysisResult.benchmarks.termComparison.terminationNotice.contract}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Market Average:</span>
                              <p className="text-sm text-gray-900">{analysisResult.benchmarks.termComparison.terminationNotice.marketAverage}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Analysis failed or no results available. Please try again.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContractAnalysisDemo;