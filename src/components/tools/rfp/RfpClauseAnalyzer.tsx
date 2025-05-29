import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Eye, 
  Download, 
  ChevronDown, 
  ChevronUp,
  MessageSquare,
  Copy,
  Edit
} from 'lucide-react';

interface RfpClauseAnalyzerProps {
  selectedRfp: string | null;
}

interface ClauseIssue {
  id: string;
  type: 'missing' | 'risk' | 'suggestion';
  title: string;
  description: string;
  section: string;
  severity: 'high' | 'medium' | 'low';
  suggestion?: string;
  isExpanded: boolean;
}

const RfpClauseAnalyzer: React.FC<RfpClauseAnalyzerProps> = ({ selectedRfp }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [issues, setIssues] = useState<ClauseIssue[]>([]);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<ClauseIssue | null>(null);
  const [isApplyingSuggestion, setIsApplyingSuggestion] = useState(false);
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'missing' | 'risk' | 'suggestion'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');

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

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Mock analysis results
      const mockIssues: ClauseIssue[] = [
        {
          id: 'issue-1',
          type: 'missing',
          title: 'Missing Data Protection Clause',
          description: 'The RFP does not include specific requirements for data protection and privacy compliance.',
          section: 'Requirements',
          severity: 'high',
          suggestion: 'Add a dedicated section on data protection requirements, including compliance with relevant regulations (e.g., GDPR, CCPA), data handling procedures, and security measures expected from vendors.',
          isExpanded: false
        },
        {
          id: 'issue-2',
          type: 'risk',
          title: 'Ambiguous Service Level Agreement Terms',
          description: 'The service level agreement (SLA) terms are vague and could lead to disputes with vendors.',
          section: 'Terms and Conditions',
          severity: 'medium',
          suggestion: 'Clearly define SLA metrics, including uptime requirements, response times, resolution times, and penalties for non-compliance. Use specific, measurable terms rather than subjective language.',
          isExpanded: false
        },
        {
          id: 'issue-3',
          type: 'suggestion',
          title: 'Enhance Evaluation Criteria',
          description: 'The evaluation criteria could be more comprehensive to ensure fair vendor comparison.',
          section: 'Evaluation Criteria',
          severity: 'low',
          suggestion: 'Consider adding more detailed evaluation criteria, including technical capabilities, implementation methodology, vendor experience, financial stability, and references. Assign specific weights to each criterion for transparency.',
          isExpanded: false
        },
        {
          id: 'issue-4',
          type: 'missing',
          title: 'No Vendor Transition Plan Requirement',
          description: 'The RFP does not require vendors to provide a transition plan for implementation.',
          section: 'Scope of Work',
          severity: 'medium',
          suggestion: 'Add a requirement for vendors to submit a detailed transition plan, including timeline, resource allocation, risk mitigation strategies, and knowledge transfer approach.',
          isExpanded: false
        },
        {
          id: 'issue-5',
          type: 'risk',
          title: 'Insufficient Intellectual Property Protection',
          description: 'The intellectual property rights section lacks clarity on ownership of customizations and deliverables.',
          section: 'Terms and Conditions',
          severity: 'high',
          suggestion: "Clearly specify that all custom development, configurations, and project deliverables become the property of your organization. Include language about licensing terms for vendor's proprietary components.",
          isExpanded: false
        }
      ];
      
      setIssues(mockIssues);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Error analyzing RFP:', error);
      // Error handling would go here
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleIssueExpand = (issueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, isExpanded: !issue.isExpanded } 
        : issue
    ));
  };

  const handleViewSuggestion = (issue: ClauseIssue) => {
    setSelectedIssue(issue);
    setShowSuggestionModal(true);
  };

  const handleApplySuggestion = async () => {
    if (!selectedIssue) return;
    
    setIsApplyingSuggestion(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would update the RFP document
      // For now, we'll just close the modal
      setShowSuggestionModal(false);
      setSelectedIssue(null);
      
      // Update the issue to show it's been addressed
      setIssues(prev => prev.map(issue => 
        issue.id === selectedIssue.id 
          ? { ...issue, type: 'suggestion', severity: 'low', description: 'This issue has been addressed.' } 
          : issue
      ));
    } catch (error) {
      console.error('Error applying suggestion:', error);
    } finally {
      setIsApplyingSuggestion(false);
    }
  };

  const handleGenerateWithAi = async () => {
    if (!aiPrompt) return;
    
    setIsGenerating(true);
    
    try {
      // Simulate API call to OpenAI
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock generated content
      const generatedContent = `Based on your request, here's a custom analysis of your RFP:\n\n${aiPrompt}\n\nThis analysis identifies potential issues and provides recommendations to improve your RFP document. Consider implementing these suggestions to enhance clarity, reduce risk, and ensure comprehensive vendor responses.`;
      
      // Add a new "suggestion" to the issues list
      const newIssue: ClauseIssue = {
        id: `issue-${Date.now()}`,
        type: 'suggestion',
        title: 'AI-Generated Analysis',
        description: 'Custom analysis based on your prompt.',
        section: 'General',
        severity: 'medium',
        suggestion: generatedContent,
        isExpanded: true
      };
      
      setIssues(prev => [...prev, newIssue]);
      
      // Close the AI prompt modal
      setShowAiPrompt(false);
      setAiPrompt('');
    } catch (error) {
      console.error('Error generating analysis:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter issues based on selected filters
  const filteredIssues = issues.filter(issue => {
    const matchesType = selectedFilter === 'all' || issue.type === selectedFilter;
    const matchesSeverity = selectedSeverity === 'all' || issue.severity === selectedSeverity;
    return matchesType && matchesSeverity;
  });

  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case 'missing':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'suggestion':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              <Zap className="h-4 w-4 text-purple-600" />
            </div>
            RFP Clause Analyzer
          </h2>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl">
            Analyze your RFP for missing clauses, risks, and improvement opportunities
          </p>
          <div className="absolute -z-10 w-20 h-20 rounded-full bg-purple-100 blur-xl opacity-40 -top-10 -left-5"></div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAiPrompt(true)}
            className="group relative flex items-center justify-center px-6 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Zap className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
            Custom Analysis
            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
          {analysisComplete && (
            <button
              onClick={handleAnalyze}
              className="flex items-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl shadow-md hover:from-primary-700 hover:to-primary-600 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
            >
              <RefreshCw className="h-4 w-4 mr-2 transition-transform duration-200 hover:rotate-180" />
              Re-analyze
            </button>
          )}
        </div>
      </div>

      {!analysisComplete ? (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Upload your RFP document</h3>
              <p className="text-sm text-gray-500 mt-1">
                Our AI will analyze your RFP for missing clauses, potential risks, and improvement opportunities
              </p>
            </div>
            
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/30 transition-all duration-300 group"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('file-upload')?.click()}
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
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3 group-hover:text-purple-500 transition-colors duration-300" />
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
                onChange={handleFileInput}
              />
            </div>
            
            <div className="mt-8 text-center">
              <button
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Analyze Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">Filter by Type:</span>
                <select
                  className="rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm transition-all duration-200 hover:border-primary-300"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as any)}
                >
                  <option value="all">All Issues</option>
                  <option value="missing">Missing Clauses</option>
                  <option value="risk">Risk Factors</option>
                  <option value="suggestion">Suggestions</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">Filter by Severity:</span>
                <select
                  className="rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm transition-all duration-200 hover:border-primary-300"
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value as any)}
                >
                  <option value="all">All Severities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="flex-grow"></div>
              
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">Document:</span>
                <span className="text-sm text-gray-500">{file?.name || 'RFP Document'}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredIssues.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">No issues found</h3>
                <p className="text-gray-500 mt-1">
                  {selectedFilter !== 'all' || selectedSeverity !== 'all'
                    ? 'No issues match your current filter criteria.'
                    : 'Your RFP looks great! No issues were detected.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">{filteredIssues.map((issue) => (
                <div key={issue.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div 
                    className={`p-4 border-l-4 ${
                      issue.severity === 'high' ? 'border-red-500' :
                      issue.severity === 'medium' ? 'border-yellow-500' :
                      'border-green-500'
                    }`}
                  >
                    <div className="flex justify-between items-start group">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIssueTypeIcon(issue.type)}
                        </div>
                        <div className="ml-3">
                          <div className="flex items-center">
                            <h3 className="text-sm font-medium text-gray-900">{issue.title}</h3>
                            <div className="ml-2">
                              {getSeverityBadge(issue.severity)}
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{issue.description}</p>
                          <p className="mt-1 text-xs text-gray-500">Section: {issue.section}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleIssueExpand(issue.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-500 transition-colors duration-200"
                      >
                        {issue.isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    
                    {issue.isExpanded && issue.suggestion && (
                      <div className="mt-4 ml-8">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Suggested Improvement</h4>
                          <p className="text-sm text-gray-600">{issue.suggestion}</p>
                          <div className="mt-4 flex justify-end space-x-3">
                            <button
                              onClick={() => handleViewSuggestion(issue)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-lg text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <button
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit RFP
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}</div>
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h3 className="text-xl font-medium text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center mr-3">
                <BarChart2 className="h-4 w-4 text-primary-600" />
              </div>
              Analysis Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                <div className="text-center relative">
                  <div className="text-3xl font-bold text-red-600 mb-1">{issues.filter(i => i.severity === 'high').length}</div>
                  <div className="text-sm text-gray-500">High Severity Issues</div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                <div className="text-center relative">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">{issues.filter(i => i.severity === 'medium').length}</div>
                  <div className="text-sm text-gray-500">Medium Severity Issues</div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                <div className="text-center relative">
                  <div className="text-3xl font-bold text-green-600 mb-1">{issues.filter(i => i.severity === 'low').length}</div>
                  <div className="text-sm text-gray-500">Low Severity Issues</div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h4 className="text-base font-medium text-gray-900 mb-3">Overall Assessment</h4>
              <div className={`p-4 rounded-md ${
                issues.some(i => i.severity === 'high')
                  ? 'bg-red-50 text-red-700'
                  : issues.some(i => i.severity === 'medium')
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {issues.some(i => i.severity === 'high') ? (
                  <p>This RFP has critical issues that should be addressed before publishing. Addressing these issues will significantly improve the quality and effectiveness of your RFP.</p>
                ) : issues.some(i => i.severity === 'medium') ? (
                  <p>This RFP has some moderate issues that would benefit from attention. Consider implementing the suggested improvements to enhance clarity and reduce potential risks.</p>
                ) : (
                  <p>This RFP is in good shape with only minor suggestions for improvement. You can proceed with confidence or implement the suggested enhancements for an even better document.</p>
                )}
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => window.location.hash = '#tools/rfp/draft'}
                className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-[1.02]"
              >
                <Edit className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-12" />
                Edit RFP
              </button>
            </div>
          </div>
        </>
      )}

      {showSuggestionModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center">
                {getIssueTypeIcon(selectedIssue.type)}
                <h3 className="text-lg font-medium text-gray-900 ml-2">{selectedIssue.title}</h3>
                <div className="ml-2">
                  {getSeverityBadge(selectedIssue.severity)}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSuggestionModal(false);
                  setSelectedIssue(null);
                }} 
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Issue Description</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedIssue.description}</p>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Affected Section</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedIssue.section}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Suggested Improvement</h4>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <p className="text-sm text-gray-600">{selectedIssue.suggestion}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedIssue.suggestion || '');
                  }}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowSuggestionModal(false);
                  setSelectedIssue(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              >
                Close
              </button>
              <button 
                onClick={handleApplySuggestion}
                disabled={isApplyingSuggestion}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
              >
                {isApplyingSuggestion ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply to RFP
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAiPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <Zap className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Custom AI Analysis</h3>
              </div>
              <button
                onClick={() => {
                  setShowAiPrompt(false);
                  setAiPrompt('');
                }}
                className="text-gray-400 hover:text-gray-500 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-8">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to analyze?
                </label>
                <textarea
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-purple-300"
                  rows={6}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., Check if our RFP has appropriate security requirements for a cloud-based ERP system. Analyze if our evaluation criteria are fair and comprehensive."
                />
              </div>
              <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                    <Zap className="h-3 w-3 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">AI Analysis Suggestions</span>
                </div>
                <div className="mt-3 space-y-3 pl-8">
                  <button
                    onClick={() => setAiPrompt("Analyze our RFP for compliance with industry best practices for IT procurement. Check if we're missing any standard sections or clauses.")}
                    className="text-sm text-left text-purple-600 hover:text-purple-800 block hover:underline transition-colors duration-200"
                  >
                    • Check for industry best practices compliance
                  </button>
                  <button
                
                    onClick={() => setAiPrompt("Review our RFP for potential legal risks or ambiguities that could lead to disputes with vendors.")}
                    className="text-sm text-left text-purple-600 hover:text-purple-800 block hover:underline transition-colors duration-200"
                  >
                    • Identify legal risks and ambiguities
                  </button>
                  <button
                    onClick={() => setAiPrompt("Analyze if our RFP provides sufficient information for vendors to prepare accurate proposals. Identify areas where more detail would be beneficial.")}
                    className="text-sm text-left text-purple-600 hover:text-purple-800 block hover:underline transition-colors duration-200"
                  >
                    • Evaluate information completeness for vendors
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowAiPrompt(false);
                  setAiPrompt('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateWithAi}
                disabled={isGenerating || !aiPrompt.trim()}
                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 border border-transparent rounded-lg hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 flex items-center transition-all duration-200 shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                    Run Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RfpClauseAnalyzer;