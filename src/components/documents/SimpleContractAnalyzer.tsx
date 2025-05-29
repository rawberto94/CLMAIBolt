import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Zap, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { analyzeContractWithGemini } from '../../services/geminiService';

interface AnalysisResult {
  overview: {
    title: string;
    type: string;
    status: string;
    parties: string[];
    value: string;
    term: string;
    description: string;
  };
  risks: Array<{
    category: string;
    description: string;
    severity: string;
    mitigation: string;
  }>;
  recommendations: Array<{
    category: string;
    suggestion: string;
    priority: string;
    impact: string;
  }>;
  keyClauses: Array<{
    title: string;
    content: string;
    importance: string;
    status: string;
    location: string;
  }>;
}

const RATE_LIMIT_DELAY = 60000; // 1 minute delay between requests

const SimpleContractAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number>(
    () => parseInt(localStorage.getItem('lastAnalysisRequestTime') || '0', 10)
  );
  const [timeUntilNextRequest, setTimeUntilNextRequest] = useState<number>(0);

  // Update timer for rate limiting
  useEffect(() => {
    const initialTimeRemaining = Math.max(0, RATE_LIMIT_DELAY - (Date.now() - lastRequestTime));
    setTimeUntilNextRequest(initialTimeRemaining);
    
    let timer: NodeJS.Timeout;
    
    if (timeUntilNextRequest > 0) {
      timer = setInterval(() => {
        const remaining = Math.max(0, RATE_LIMIT_DELAY - (Date.now() - lastRequestTime));
        setTimeUntilNextRequest(remaining);
        
        if (remaining === 0) {
          clearInterval(timer);
        }
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timeUntilNextRequest, lastRequestTime]);

  const handleAnalyze = async () => {
    try {
      if (!file) {
        throw new Error("Please upload a contract file first");
      }

      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      
      if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
        const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest;
        setTimeUntilNextRequest(waitTime);
        throw new Error(`Too many requests. Please try again in a few minutes.`);
      }

      setIsAnalyzing(true);
      setUploadError(null);
      
      // Read the file content
      let fileContent = await readFileAsText(file);
      
      // Call the Gemini API to analyze the contract
      const result = await analyzeContractWithGemini(fileContent);
      
      // Update last request time after successful API call
      const completionTime = Date.now();
      setLastRequestTime(completionTime);
      localStorage.setItem('lastAnalysisRequestTime', completionTime.toString());
      
      if (!result.success) {
        throw new Error(result.error || "Failed to analyze contract. Please try again later.");
      }
      
      // Parse the analysis result into our expected format
      const analysisResult = parseGeminiResponse(result.analysis);
      setAnalysisResult(analysisResult);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Error in handleAnalyze:', error);
      
      if (error instanceof Error && error.message.includes("Too many requests")) {
        setUploadError("Too many requests. Please try again in a few minutes.");
      } else if (error instanceof Error && error.message.includes("API model is not available")) {
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
        description: "Contract analysis provided by AI"
      },
      keyClauses: [],
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
      }
      
      // Extract term
      const termMatch = analysisText.match(/(?:term|duration):?\s*([^\n]+)/i);
      if (termMatch && termMatch[1]) {
        result.overview.term = termMatch[1].trim();
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
      // If parsing fails, we still have the raw analysis
    }
    
    return result;
  };

  // Function to format time remaining in a human-readable format
  const formatTimeRemaining = (milliseconds: number): string => {
    if (milliseconds <= 0) return "0s";
    
    const seconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
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
              accept=".txt,.doc,.docx"
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
                  Drag and drop or click to select a file (text files only)
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

        {timeUntilNextRequest > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2 text-yellow-700">
            <Clock className="h-5 w-5" />
            <p>Rate limit reached. Please wait {formatTimeRemaining(timeUntilNextRequest)} before making another request.</p>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing || timeUntilNextRequest > 0}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-md font-medium
              ${(!file || isAnalyzing || timeUntilNextRequest > 0)
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
            ) : timeUntilNextRequest > 0 ? (
              <>
                <Clock className="h-5 w-5" />
                Wait {formatTimeRemaining(timeUntilNextRequest)}
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

export default SimpleContractAnalyzer;