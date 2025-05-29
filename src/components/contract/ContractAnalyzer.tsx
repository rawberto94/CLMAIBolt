import React, { useState } from 'react';
import { 
  FileText, 
  Save, 
  Download, 
  Upload, 
  Zap, 
  CheckCircle, 
  X, 
  RefreshCw, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Settings,
  Copy,
  Clock,
  DollarSign,
  Calendar
} from 'lucide-react';
import { analyzeContractWithGemini } from '../../services/geminiService';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface AnalysisResult {
  overview: {
    title: string;
    type: string;
    status: string;
    parties: string[];
    value: string;
    term: string;
    description: string;
    aiAnalysis: string;
  };
  financialAnalysis: {
    totalValue: string;
    termLength: string;
    paymentTerms: {
      frequency: string;
      terms: string;
      daysToPayment: number;
    };
    framework: {
      type: string;
      maxValue: string;
      consumed: string;
      remaining: string;
      utilizationRate: number;
    };
    rateCards: any[];
    fees: any[];
    discounts: any[];
    budgetAllocation: {
      total: string;
      spent: string;
      committed: string;
      available: string;
      fiscalYear: string;
    };
    costBreakdown: any[];
    financialRisks: any[];
  };
  contractTerms: {
    startDate: string;
    endDate: string;
    renewalType: string;
    noticePeriod: string;
    terminationClauses: any[];
  };
  keyClauses: any[];
  obligations: any[];
  risks: any[];
  recommendations: any[];
}

const ContractAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    try {
      if (!file) {
        throw new Error("Please upload a contract file first");
      }

      setIsAnalyzing(true);
      setUploadError(null);
      
      // Read the file content
      const fileContent = await readFileAsText(file);
      
      // Call the Gemini API to analyze the contract
      const result = await analyzeContractWithGemini(fileContent);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to analyze contract. Please try again later.");
      }
      
      // Parse the analysis result into our expected format
      const analysisResult = parseGeminiResponse(result.analysis);
      setAnalysisResult(analysisResult);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Error in handleAnalyze:', error);
      
      if (error instanceof Error && error.message.includes("API model is not available")) {
        setUploadError("The AI analysis service is currently unavailable. Please ensure you're using models/gemini-2.0-flash.");
      } else {
        setUploadError(error instanceof Error ? error.message : "An unexpected error occurred while analyzing the contract.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to read file content as text
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

  // Function to parse Gemini's response into our expected format
  const parseGeminiResponse = (analysisText: string): AnalysisResult => {
    // Create a default structure for the analysis result
    const result: AnalysisResult = {
      overview: {
        title: file?.name || "Uploaded Contract",
        type: "Contract",
        status: "Active",
        parties: [],
        value: "Not specified",
        term: "Not specified",
        description: "Contract analysis provided by AI",
        aiAnalysis: analysisText
      },
      financialAnalysis: {
        totalValue: "Not specified",
        termLength: "Not specified",
        paymentTerms: {
          frequency: "Not specified",
          terms: "Not specified",
          daysToPayment: 0
        },
        framework: {
          type: "Not specified",
          maxValue: "Not specified",
          consumed: "Not specified",
          remaining: "Not specified",
          utilizationRate: 0
        },
        rateCards: [],
        fees: [],
        discounts: [],
        budgetAllocation: {
          total: "Not specified",
          spent: "Not specified",
          committed: "Not specified",
          available: "Not specified",
          fiscalYear: "Not specified"
        },
        costBreakdown: [],
        financialRisks: []
      },
      contractTerms: {
        startDate: "Not specified",
        endDate: "Not specified",
        renewalType: "Not specified",
        noticePeriod: "Not specified",
        terminationClauses: []
      },
      keyClauses: [],
      obligations: [],
      risks: [],
      recommendations: []
    };
    
    // Try to extract some basic information from the analysis text
    try {
      // Extract parties
      const partiesMatch = analysisText.match(/Parties involved:[\s\S]*?(?=\n\n|\n[A-Z]|$)/i);
      if (partiesMatch) {
        const partiesText = partiesMatch[0];
        const parties = partiesText.split('\n')
          .filter(line => line.trim() && !line.includes('Parties involved:'))
          .map(line => line.replace(/^[-•*]\s*/, '').trim());
        
        if (parties.length > 0) {
          result.overview.parties = parties;
        }
      }
      
      // Extract contract type
      const typeMatch = analysisText.match(/(?:contract|agreement) type:?\s*([^\n]+)/i);
      if (typeMatch && typeMatch[1]) {
        result.overview.type = typeMatch[1].trim();
      }
      
      // Extract contract value
      const valueMatch = analysisText.match(/(?:contract|total) value:?\s*([^\n]+)/i);
      if (valueMatch && valueMatch[1]) {
        result.overview.value = valueMatch[1].trim();
        result.financialAnalysis.totalValue = valueMatch[1].trim();
      }
      
      // Extract term
      const termMatch = analysisText.match(/(?:term|duration):?\s*([^\n]+)/i);
      if (termMatch && termMatch[1]) {
        result.overview.term = termMatch[1].trim();
        result.financialAnalysis.termLength = termMatch[1].trim();
      }
      
      // Extract dates
      const startDateMatch = analysisText.match(/(?:start|effective) date:?\s*([^\n]+)/i);
      if (startDateMatch && startDateMatch[1]) {
        result.contractTerms.startDate = startDateMatch[1].trim();
      }
      
      const endDateMatch = analysisText.match(/(?:end|expiration|termination) date:?\s*([^\n]+)/i);
      if (endDateMatch && endDateMatch[1]) {
        result.contractTerms.endDate = endDateMatch[1].trim();
      }
      
      // Extract payment terms
      const paymentTermsMatch = analysisText.match(/payment terms:[\s\S]*?(?=\n\n|\n[A-Z]|$)/i);
      if (paymentTermsMatch) {
        const paymentText = paymentTermsMatch[0];
        result.financialAnalysis.paymentTerms.terms = paymentText.replace(/payment terms:?\s*/i, '').trim();
      }
      
      // Extract risks
      const risksMatch = analysisText.match(/risks:[\s\S]*?(?=\n\n|\n[A-Z]|$)/i);
      if (risksMatch) {
        const risksText = risksMatch[0];
        const risks = risksText.split('\n')
          .filter(line => line.trim() && !line.includes('Risks:'))
          .map(line => {
            const riskText = line.replace(/^[-•*]\s*/, '').trim();
            return {
              category: "Identified Risk",
              description: riskText,
              severity: riskText.toLowerCase().includes('high') ? 'high' : 
                        riskText.toLowerCase().includes('medium') ? 'medium' : 'low',
              mitigation: "Review with legal team"
            };
          });
        
        if (risks.length > 0) {
          result.risks = risks;
        }
      }
      
      // Extract recommendations
      const recommendationsMatch = analysisText.match(/recommendations:[\s\S]*?(?=\n\n|\n[A-Z]|$)/i);
      if (recommendationsMatch) {
        const recommendationsText = recommendationsMatch[0];
        const recommendations = recommendationsText.split('\n')
          .filter(line => line.trim() && !line.includes('Recommendations:'))
          .map(line => {
            const recText = line.replace(/^[-•*]\s*/, '').trim();
            return {
              category: "Improvement",
              suggestion: recText,
              priority: recText.toLowerCase().includes('critical') || recText.toLowerCase().includes('important') ? 'high' : 'medium',
              impact: "Improves contract clarity and reduces risk"
            };
          });
        
        if (recommendations.length > 0) {
          result.recommendations = recommendations;
        }
      }
      
      // Extract key clauses
      const clausesMatch = analysisText.match(/key (?:clauses|terms):[\s\S]*?(?=\n\n|\n[A-Z]|$)/i);
      if (clausesMatch) {
        const clausesText = clausesMatch[0];
        const clauses = clausesText.split('\n')
          .filter(line => line.trim() && !line.includes('Key Clauses:') && !line.includes('Key Terms:'))
          .map(line => {
            const clauseText = line.replace(/^[-•*]\s*/, '').trim();
            return {
              title: clauseText.split(':')[0] || "Key Clause",
              content: clauseText,
              importance: clauseText.toLowerCase().includes('critical') ? 'critical' : 
                          clauseText.toLowerCase().includes('important') ? 'high' : 'medium',
              status: 'compliant',
              location: "Contract"
            };
          });
        
        if (clauses.length > 0) {
          result.keyClauses = clauses;
        }
      }
      
      // Create a summary description
      const summaryMatch = analysisText.match(/summary:[\s\S]*?(?=\n\n|\n[A-Z]|$)/i);
      if (summaryMatch) {
        result.overview.description = summaryMatch[0].replace(/summary:?\s*/i, '').trim();
      }
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      // If parsing fails, we still have the raw analysis in aiAnalysis
    }
    
    return result;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Contract Analyzer
          </h2>
        </div>

        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              id="contract-file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setUploadError(null);
                  setAnalysisComplete(false);
                }
              }}
            />
            <label
              htmlFor="contract-file"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {file ? file.name : "Upload your contract"}
                </p>
                <p className="text-sm text-gray-500">
                  Drag and drop or click to select a file
                </p>
              </div>
            </label>
          </div>
        </div>

        {uploadError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <p>{uploadError}</p>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-md font-medium
              ${(!file || isAnalyzing)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Analyze Contract
              </>
            )}
          </button>
        </div>

        {analysisComplete && analysisResult && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
            
            {/* Overview Section */}
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-3">Overview</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500">Contract Type</p>
                  <p className="font-medium">{analysisResult.overview.type}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500">Value</p>
                  <p className="font-medium">{analysisResult.overview.value}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500">Term</p>
                  <p className="font-medium">{analysisResult.overview.term}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{analysisResult.overview.status}</p>
                </div>
              </div>
            </div>

            {/* Risks Section */}
            {analysisResult.risks.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">Key Risks</h4>
                <div className="space-y-3">
                  {analysisResult.risks.map((risk, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`h-5 w-5 ${
                          risk.severity === 'high' ? 'text-red-500' :
                          risk.severity === 'medium' ? 'text-yellow-500' :
                          'text-blue-500'
                        }`} />
                        <span className="font-medium capitalize">{risk.severity} Risk</span>
                      </div>
                      <p className="text-gray-700">{risk.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations Section */}
            {analysisResult.recommendations.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">Recommendations</h4>
                <div className="space-y-3">
                  {analysisResult.recommendations.map((rec, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">{rec.category}</span>
                      </div>
                      <p className="text-gray-700">{rec.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractAnalyzer;