import React from 'react';
import { FileUpload } from '../contract-analyzer/FileUpload';
import { AnalysisDisplay } from '../contract-analyzer/AnalysisDisplay';
import { useAnalysisContext } from '../../contexts/AnalysisContext';

/**
 * Modern contract analyzer interface with side-by-side layout
 * for file upload and analysis results.
 */
const ContractAnalyzer: React.FC = () => {
  const { currentAnalysis } = useAnalysisContext();

  return (
    <div className="min-h-[80vh] p-6 bg-gradient-to-br from-gray-50 to-blue-100 rounded-xl">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
        Contract Analysis
      </h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-md p-6">
          <FileUpload />
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-md p-6">
          {currentAnalysis ? (
            <AnalysisDisplay />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Upload a contract to see analysis results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractAnalyzer;