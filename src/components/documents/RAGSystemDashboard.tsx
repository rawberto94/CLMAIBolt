import React, { useState, useEffect } from 'react';
import { Database, Upload, RefreshCw, Settings, AlertTriangle, FileText, Zap, BarChart2 } from 'lucide-react';
import { initializeContractRAG, addContractFileToRAG } from '../../services/contractRagService';
import RAGQueryInterface from './RAGQueryInterface';
import ContractAnalyzerRAGMetrics from './ContractAnalyzerRAGMetrics';

interface RAGSystemDashboardProps {
  onFileAnalyze?: (file: File) => void;
}

const RAGSystemDashboard: React.FC<RAGSystemDashboardProps> = ({ onFileAnalyze }) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [metrics, setMetrics] = useState({
    retrievalAccuracy: 0.92,
    factualAccuracy: 0.95,
    averageLatency: 850,
    hallucinations: 0.05,
    documentsIndexed: 2,
    queriesProcessed: 0,
    averageTokens: 1250
  });

  // Initialize RAG system on component mount
  useEffect(() => {
    const initRAG = async () => {
      try {
        setIsInitializing(true);
        setError(null);
        await initializeContractRAG();
        setIsInitialized(true);
        setMetrics(prev => ({
          ...prev,
          documentsIndexed: 2 // Sample contracts
        }));
      } catch (error) {
        console.error("Failed to initialize RAG system:", error);
        setError("Failed to initialize the knowledge base. Please try again later.");
      } finally {
        setIsInitializing(false);
      }
    };
    
    initRAG();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const selectedFile = files[0];
    setFile(selectedFile);
    
    if (onFileAnalyze) {
      onFileAnalyze(selectedFile);
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      // Add file to RAG system
      const contractId = `contract-${Date.now()}`;
      const metadata = {
        title: selectedFile.name,
        uploadDate: new Date().toISOString(),
        fileType: selectedFile.type,
        fileSize: selectedFile.size
      };
      
      await addContractFileToRAG(contractId, selectedFile, metadata);
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        documentsIndexed: prev.documentsIndexed + 1
      }));
      
    } catch (error) {
      console.error("Error uploading file to RAG system:", error);
      setError("Failed to add document to knowledge base. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleQueryComplete = () => {
    // Update metrics when a query is completed
    setMetrics(prev => ({
      ...prev,
      queriesProcessed: prev.queriesProcessed + 1
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Database className="h-6 w-6 mr-2 text-primary-600" />
            Contract Knowledge Base
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Retrieval-Augmented Generation system for contract analysis and queries
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
          <label className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Add Document
            <input
              type="file"
              className="hidden"
              accept=".pdf,.txt,.docx"
              onChange={handleFileUpload}
              disabled={isUploading || !isInitialized}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-md flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {isInitializing ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <RefreshCw className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Initializing Knowledge Base</h3>
          <p className="text-gray-500">
            Setting up the RAG system with sample contracts...
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <RAGQueryInterface 
                isInitialized={isInitialized}
                isInitializing={isInitializing}
                documentsIndexed={metrics.documentsIndexed}
                onQueryComplete={() => handleQueryComplete}
              />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 text-primary-600 mr-2" />
                Knowledge Base
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Documents Indexed</span>
                  <span className="text-sm font-medium text-gray-900">{metrics.documentsIndexed}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, metrics.documentsIndexed * 10)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Queries Processed</span>
                  <span className="text-sm font-medium text-gray-900">{metrics.queriesProcessed}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, metrics.queriesProcessed * 10)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Retrieval Accuracy</span>
                  <span className="text-sm font-medium text-gray-900">{(metrics.retrievalAccuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${metrics.retrievalAccuracy * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Factual Accuracy</span>
                  <span className="text-sm font-medium text-gray-900">{(metrics.factualAccuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${metrics.factualAccuracy * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Hallucination Rate</span>
                  <span className="text-sm font-medium text-gray-900">{(metrics.hallucinations * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${metrics.hallucinations * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Zap className="h-4 w-4 text-primary-600 mr-1" />
                  RAG System Benefits
                </h4>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1.5 mr-2"></span>
                    <span>Enhanced accuracy with contextual knowledge</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1.5 mr-2"></span>
                    <span>Reduced hallucinations with source grounding</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1.5 mr-2"></span>
                    <span>Transparent source attribution</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1.5 mr-2"></span>
                    <span>Improved contract-specific knowledge</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => window.location.hash = '#tools/rag-analyzer'}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  View Detailed Metrics
                </button>
              </div>
            </div>
          </div>
          
          <ContractAnalyzerRAGMetrics metrics={metrics} />
        </>
      )}
      
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">RAG System Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chunk Size
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  defaultValue={1000}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Size of text chunks for document indexing
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chunk Overlap
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  defaultValue={200}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Overlap between consecutive chunks
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retrieval Top K
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  defaultValue={5}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Number of documents to retrieve for each query
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Similarity Threshold
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  defaultValue={0.7}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum similarity score for retrieved documents
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RAGSystemDashboard;