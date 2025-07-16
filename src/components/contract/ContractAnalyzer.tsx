import React from 'react';
import { FileUpload } from '../contract-analyzer/FileUpload';
import { AnalysisDisplay } from '../contract-analyzer/AnalysisDisplay';
import { useAnalysisContext } from '../../contexts/AnalysisContext';

/**
 * ContractAnalyzer component that serves as the main entry point for the contract analysis feature.
 * It uses the AnalysisContext to handle file upload, analysis state, and displaying results.
 */
const ContractAnalyzer: React.FC = () => {
  const { 
    currentAnalysis, 
    isAnalyzing, 
    uploadError, 
    activeTab, 
    setActiveTab, 
    analysisProgress 
  } = useAnalysisContext();

  // Render different views based on whether we have analysis results or not
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Contract Analysis Tool</h2>
          <div className="flex space-x-4">
            {currentAnalysis && (
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setActiveTab('analyze')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'analyze' 
                      ? 'bg-primary-100 text-primary-800 border-b-2 border-primary-500' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Analysis
                </button>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'chat' 
                      ? 'bg-primary-100 text-primary-800 border-b-2 border-primary-500' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Ask Questions
                </button>
              </div>
            )}
          </div>
        </div>

        {!currentAnalysis && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-lg font-medium text-gray-900">Upload a contract for analysis</h3>
              <p className="mt-1 text-sm text-gray-500">
                Our AI will analyze your document to extract key terms, identify risks, and provide actionable insights.
              </p>
            </div>

            {/* File upload component that connects to the analysis context */}
            <FileUpload />
          </div>
        )}

        {currentAnalysis && activeTab === 'analyze' && (
          <AnalysisDisplay />
        )}

        {currentAnalysis && activeTab === 'chat' && (
          <div className="text-center p-10 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">Chat functionality coming soon</h3>
            <p className="text-gray-500 mt-2">
              You'll be able to ask questions about your contract and get AI-powered answers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractAnalyzer;