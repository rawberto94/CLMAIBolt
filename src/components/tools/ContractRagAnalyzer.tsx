import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Zap, 
  CheckCircle, 
  RefreshCw, 
  AlertTriangle, 
  Download
} from 'lucide-react';
import { initializeContractRAG, analyzeContractWithRAG } from '../../services/contractRagService';
import { extractTextFromPDF } from '../../services/pdfService';

const ContractRagAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Initialize RAG system on component mount
  useEffect(() => {
    const initRAG = async () => {
      try {
        setIsInitializing(true);
        setUploadError(null);
        await initializeContractRAG();
        setIsInitialized(true);
        console.log("RAG system initialized successfully");
      } catch (error) {
        console.error("Failed to initialize RAG system:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to initialize the knowledge base.";
        
        // Check if the error is related to the API key
        if (errorMessage.includes('API key')) {
          setUploadError("Gemini API key is missing or invalid. Please check your environment configuration.");
        } else {
          setUploadError("Failed to initialize the knowledge base. Please try again later.");
        }
      } finally {
        setIsInitializing(false);
      }
    };
    
    initRAG();
  }, []);

  const handleAnalyze = async () => {
    try {
      if (!file) {
        throw new Error("Please upload a contract file first");
      }

      if (!isInitialized) {
        throw new Error("Analysis system is not ready. Please wait for initialization to complete.");
      }

      setIsAnalyzing(true);
      setUploadError(null);
      
      // Read the file content
      let fileContent: string;
      
      // Handle different file types
      if (file.type === 'application/pdf') {
        try {
          fileContent = await extractTextFromPDF(file);
        } catch (error) {
          throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        // For text files, read directly
        fileContent = await readFileAsText(file);
      }
      
      if (!fileContent || fileContent.trim() === '') {
        throw new Error("No text content could be extracted from the file. Please try a different file.");
      }
      
      // Call the RAG service to analyze the contract
      const result = await analyzeContractWithRAG(fileContent);
      
      if (!result) {
        throw new Error("Analysis failed to produce a result. Please try again.");
      }
      
      setAnalysisResult(result);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Error in handleAnalyze:', error);
      
      setUploadError(error instanceof Error ? error.message : "An unexpected error occurred while analyzing the contract.");
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
    // Reset any previous analysis
    setAnalysisComplete(false);
    setAnalysisResult(null);
    setUploadError(null);
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

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            RAG-Enhanced Contract Analyzer
          </h2>
        </div>

        {isInitializing && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2 text-blue-700 animate-pulse">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <p>Initializing RAG system...</p>
          </div>
        )}

        {uploadError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <p>{uploadError}</p>
          </div>
        )}

        <div className="mb-6">
          <div className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${!isInitialized ? 'opacity-50' : ''}`}>
            <input
              type="file"
              id="contract-file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileInput}
              disabled={!isInitialized}
            />
            <label
              htmlFor="contract-file"
              className={`flex flex-col items-center gap-3 ${isInitialized ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => e.preventDefault()}
            >
              {file ? (
                <div>
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-medium text-gray-700">{file.name}</p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Upload your contract
                    </p>
                    <p className="text-sm text-gray-500">
                      Drag and drop or click to select a file
                    </p>
                  </div>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing || !isInitialized}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-md font-medium
              ${(!file || isAnalyzing || !isInitialized)
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
            <h3 className="text-xl font-semibold mb-4">Contract Analysis</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="prose max-w-none">
                {analysisResult.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractRagAnalyzer;