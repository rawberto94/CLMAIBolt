import React from 'react';
import { AnalysisProvider, useAnalysisContext } from '../../context/AnalysisContext';

// Import the main UI views we created
import { FileUpload } from '../contract-analyzer/FileUpload';
import { AnalysisDisplay } from './AnalysisDisplay'; // We will create this inline now

// Import all the section components we just built
import { OverviewSection } from '../contract-analyzer/OverviewSection';
import { FinancialsSection } from '../contract-analyzer/FinancialsSection';
import { ObligationsSection } from '../contract-analyzer/ObligationsSection';
import { RisksSection } from '../contract-analyzer/RisksSection';
import { ComplianceSection } from '../contract-analyzer/ComplianceSection';
import { RecommendationsSection } from '../contract-analyzer/RecommendationsSection';

// Import necessary icons
import { FileSearch, Plus, X, AlertTriangle } from 'lucide-react';

// This is the new results display area that assembles all the section components
const ResultsDisplay = () => {
    const { currentAnalysis } = useAnalysisContext();

    if (!currentAnalysis) {
        return null; // Should not happen if this component is rendered, but good practice
    }

    return (
        <div className="space-y-6">
            <OverviewSection overview={currentAnalysis.overview} />
            <FinancialsSection financials={currentAnalysis.financials} />
            <ObligationsSection obligations={currentAnalysis.obligations} />
            <RisksSection risks={currentAnalysis.risks} />
            <ComplianceSection compliance={currentAnalysis.compliance} />
            <RecommendationsSection recommendations={currentAnalysis.recommendations} />
            {/* The Benchmarks section can be added here in the future */}
        </div>
    );
}

// This is the main layout for our tool
const MainLayout = () => {
    const { currentAnalysis, uploadError, setUploadError, resetStateForNewAnalysis } = useAnalysisContext();

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FileSearch className="h-8 w-8 text-blue-600" />
                        AI Contract Analyzer
                    </h1>
                    <p className="mt-1 text-gray-600">
                        Leverage AI to extract key insights, identify risks, and ensure compliance.
                    </p>
                </div>
                 {currentAnalysis && (
                    <button
                        onClick={resetStateForNewAnalysis}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                        title="Analyze New Contract"
                    >
                        <Plus className="h-5 w-5" />
                        New Analysis
                    </button>
                )}
            </header>

            {uploadError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-medium">An Error Occurred</p>
                        <p className="text-sm mt-1">{uploadError}</p>
                    </div>
                    <button onClick={() => setUploadError(null)} className="p-1 hover:bg-red-100 rounded-full -m-1"><X className="h-4 w-4" /></button>
                </div>
            )}
            
            <main className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
                {/* This is the core logic: show results if they exist, otherwise show the upload form */}
                {currentAnalysis ? <ResultsDisplay /> : <FileUpload />}
            </main>
        </div>
    );
};

// The final component that wraps everything in the context provider
const ContractAnalyzer = () => (
    <AnalysisProvider>
        <MainLayout />
    </AnalysisProvider>
);

export default ContractAnalyzer;
