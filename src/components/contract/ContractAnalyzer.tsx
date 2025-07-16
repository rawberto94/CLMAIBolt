import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Upload, Zap, CheckCircle, X, RefreshCw, AlertTriangle, Download,
  DollarSign, Calendar, Shield, BarChart2, ChevronDown, ChevronUp
} from 'lucide-react';
import { AnalysisResult } from '../../types';

// Progress tracking interface
interface AnalysisProgress {
  status: string;
  percentage: number;
  message?: string;
}

const ContractAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<Partial<AnalysisResult> | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true, financials: true, obligations: true, risks: true, compliance: true, recommendations: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setUploadError(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleProgress = (progress: AnalysisProgress) => {
    setUploadProgress(progress.percentage);
    if (progress.status === 'error') setUploadError(progress.message || 'An error occurred during analysis');
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setUploadError(null);
    setUploadProgress(0);
    
    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Simulate analysis result with mock data
      const result: Partial<AnalysisResult> = {
        overview: {
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          type: "Master Service Agreement",
          status: "Active",
          parties: ["Acme Corporation", "Your Company"],
          effectiveDate: "2025-01-01",
          expirationDate: "2026-12-31",
          totalValue: "$500,000",
          description: "Comprehensive service agreement covering software development and maintenance services."
        },
        financials: {
          totalValue: 500000,
          currency: "USD",
          paymentTerms: {
            schedule: "Monthly",
            terms: "Net 30",
            latePaymentFee: "1.5% per month",
            earlyPaymentDiscount: "2% if paid within 10 days"
          },
          rateCards: [
            { role: "Senior Developer", rate: 150, unit: "hour" },
            { role: "Project Manager", rate: 175, unit: "hour" },
            { role: "Quality Assurance", rate: 125, unit: "hour" }
          ],
          fees: [
            { type: "Travel", description: "As incurred with prior approval", cap: "$10,000 per quarter" }
          ],
          invoicingFrequency: "Monthly",
          budgetAllocation: {
            year1: 200000,
            year2: 150000,
            year3: 150000
          }
        },
        risks: [
          {
            category: "Financial",
            description: "No cap on liability could pose significant financial risk",
            severity: "High",
            impact: "Potential for unlimited financial exposure",
            mitigation: "Negotiate a reasonable liability cap"
          },
          {
            category: "Compliance",
            description: "Missing data protection clauses required by GDPR",
            severity: "Medium",
            impact: "Potential regulatory fines and penalties",
            mitigation: "Add GDPR-compliant data protection clauses"
          }
        ],
        compliance: {
          score: 85,
          requirements: [
            { category: "Data Protection", status: "Compliant", details: "Appropriate data protection clauses included" },
            { category: "Payment Terms", status: "Compliant", details: "Payment terms align with company policy" },
            { category: "Termination", status: "Non-Compliant", details: "Missing required termination for convenience clause" }
          ],
          industryRegulations: [
            { name: "GDPR", status: "Compliant", details: "Contains required data protection provisions" },
            { name: "SOX", status: "At Risk", details: "Missing audit rights clause" }
          ]
        },
        recommendations: [
          {
            priority: "High",
            description: "Add liability cap to limit financial exposure",
            benefit: "Reduces financial risk and aligns with industry standards",
            effort: "Low"
          },
          {
            priority: "Medium",
            description: "Include termination for convenience clause",
            benefit: "Provides flexibility to terminate the agreement if needed",
            effort: "Low"
          }
        ]
      };
      
      setAnalysisResult(result);
      setAnalysisComplete(true);
    } catch (error: any) {
      setUploadError(error.message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'text-red-700 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency 
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {!analysisComplete ? (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-primary-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Upload your contract</h3>
              <p className="text-sm text-gray-500 mt-1">
                Our AI will analyze your contract and extract key information, risks, and recommendations
              </p>
            </div>
            
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 transition-all duration-300 group"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div>
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-base font-medium text-gray-900">{file.name}</p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3 group-hover:text-primary-500 transition-colors duration-300" />
                  <p className="text-base font-medium text-gray-900">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports PDF, DOCX, and TXT files up to 10MB
                  </p>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc,.txt"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
            </div>
            
            {uploadError && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-700 text-sm flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
                <div>
                  <p className="font-medium">Error:</p>
                  <p>{uploadError}</p>
                </div>
              </div>
            )}
            
            <div className="mt-8 text-center">
              <button
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Analyze Contract
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{analysisResult?.overview?.title || 'Contract Analysis Results'}</h2>
                <p className="text-sm text-gray-500">
                  {file?.name} • Analyzed on {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setAnalysisComplete(false);
                    setAnalysisResult(null);
                    setUploadProgress(0);
                  }}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  New Analysis
                </button>
              </div>
            </div>
          </div>

          {/* Contract Score Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contract Score</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="inline-block p-3 bg-green-50 rounded-full mb-2">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">85%</div>
                <div className="text-sm text-gray-500">Overall Score</div>
              </div>
              <div>
                <div className="inline-block p-3 bg-yellow-50 rounded-full mb-2">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">30%</div>
                <div className="text-sm text-gray-500">Risk Score</div>
              </div>
              <div>
                <div className="inline-block p-3 bg-blue-50 rounded-full mb-2">
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">90%</div>
                <div className="text-sm text-gray-500">Compliance</div>
              </div>
              <div>
                <div className="inline-block p-3 bg-purple-50 rounded-full mb-2">
                  <BarChart2 className="h-6 w-6 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">85%</div>
                <div className="text-sm text-gray-500">Completeness</div>
              </div>
            </div>
          </div>
          
          {/* Overview Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div 
              className="flex justify-between items-center p-6 cursor-pointer"
              onClick={() => toggleSection('overview')}
            >
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary-600" />
                Contract Overview
              </h3>
              {expandedSections.overview ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
            
            {expandedSections.overview && analysisResult?.overview && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Contract Type</h4>
                      <p className="text-base font-medium text-gray-900">{analysisResult.overview.type || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <p className="text-base font-medium text-gray-900">{analysisResult.overview.status || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Effective Date</h4>
                      <p className="text-base font-medium text-gray-900">{analysisResult.overview.effectiveDate || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Expiration Date</h4>
                      <p className="text-base font-medium text-gray-900">{analysisResult.overview.expirationDate || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Parties</h4>
                      <ul className="mt-1 space-y-1">
                        {analysisResult.overview.parties && analysisResult.overview.parties.map((party: string, index: number) => (
                          <li key={index} className="text-base font-medium text-gray-900">{party}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Total Value</h4>
                      <p className="text-base font-medium text-gray-900">{analysisResult.overview.totalValue || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Description</h4>
                      <p className="text-base text-gray-900">{analysisResult.overview.description || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Financials Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div 
              className="flex justify-between items-center p-6 cursor-pointer"
              onClick={() => toggleSection('financials')}
            >
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-primary-600" />
                Financial Details
              </h3>
              {expandedSections.financials ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
            
            {expandedSections.financials && analysisResult?.financials && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Total Value</h4>
                      <p className="text-lg font-medium text-gray-900">
                        {analysisResult.financials.currency} {analysisResult.financials.totalValue.toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Payment Terms</h4>
                      <div className="mt-1 bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Schedule</span>
                          <span className="text-sm font-medium text-gray-900">{analysisResult.financials.paymentTerms.schedule}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Terms</span>
                          <span className="text-sm font-medium text-gray-900">{analysisResult.financials.paymentTerms.terms}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {analysisResult.financials.rateCards && analysisResult.financials.rateCards.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Rate Cards</h4>
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Role</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Rate</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Unit</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {analysisResult.financials.rateCards.map((rate: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm">{rate.role}</td>
                                <td className="px-4 py-2 text-sm text-right">
                                  {formatCurrency(rate.rate, analysisResult.financials.currency)}
                                </td>
                                <td className="px-4 py-2 text-sm">{rate.unit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Risks Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div 
              className="flex justify-between items-center p-6 cursor-pointer"
              onClick={() => toggleSection('risks')}
            >
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-primary-600" />
                Risk Analysis
              </h3>
              {expandedSections.risks ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
            
            {expandedSections.risks && analysisResult?.risks && (
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  {analysisResult.risks.map((risk: any, index: number) => (
                    <div 
                      key={index}
                      className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(risk.severity)}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`font-semibold text-base`}>{risk.category} Risk</p>
                          <p className="mt-1 text-gray-700">{risk.description}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(risk.severity)}`}>
                          {risk.severity}
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <p className="font-medium text-gray-600">Potential Impact:</p>
                          <p className="text-gray-700">{risk.impact}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Suggested Mitigation:</p>
                          <p className="text-gray-700">{risk.mitigation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div 
              className="flex justify-between items-center p-6 cursor-pointer"
              onClick={() => toggleSection('recommendations')}
            >
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
                Recommendations
              </h3>
              {expandedSections.recommendations ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
            
            {expandedSections.recommendations && analysisResult?.recommendations && (
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  {analysisResult.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="border bg-white rounded-lg p-4 transition-shadow hover:shadow-md">
                      <div className="flex justify-between items-start">
                        <p className="text-base text-gray-800 flex-1 pr-4">{rec.description}</p>
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getSeverityColor(rec.priority)}`}>
                          {rec.priority} Priority
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <p className="font-medium text-gray-600">Benefit:</p>
                          <p className="text-gray-700">{rec.benefit}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Implementation Effort:</p>
                          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${getSeverityColor(rec.effort)}`}>
                            {rec.effort}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ContractAnalyzer;