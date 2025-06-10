import React from 'react';
import { useState, useEffect } from 'react';
// Corrected relative paths
import { AnalysisProvider, useAnalysisContext } from '../../context/AnalysisContext';
import { initializeContractRAG } from '../../services/contractRagService';
import { FileUpload } from '../contract-analyzer/FileUpload';
import { AnalysisDisplay } from '../contract-analyzer/AnalysisDisplay';
// Icons
import { FileSearch, CheckCircle, RefreshCw, AlertTriangle, X, Plus, Settings } from 'lucide-react';

const MainLayout = () => {
    const { currentAnalysis, uploadError, setUploadError, resetStateForNewAnalysis } = useAnalysisContext();
    const [isInitializing, setIsInitializing] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                await initializeContractRAG();
                setIsInitialized(true);
            } catch (error) {
                console.error("Initialization failed:", error);
                setUploadError(error instanceof Error ? error.message : "Failed to initialize the analysis engine.");
            } finally {
                setIsInitializing(false);
            }
        };
        init();
    }, [setUploadError]);

    return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
            <div className="bg-white rounded-xl shadow-lg min-h-[80vh]">
                <header className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-3">
                            <FileSearch className="h-7 w-7 text-blue-600" />
                            <span>AI Contract Analyzer</span>
                        </h2>
                        <div className="flex items-center gap-3">
                            {isInitializing && <span className="flex items-center gap-1.5 text-sm text-gray-500"><RefreshCw className="h-4 w-4 animate-spin" />Initializing...</span>}
                            {isInitialized && <span className="flex items-center gap-1.5 text-sm text-green-600"><CheckCircle className="h-4 w-4" />System Ready</span>}
                        </div>
                    </div>
                </header>
                <main className="p-4 sm:p-6">
                    {uploadError && (
                         <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
                           <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                           <div className="flex-1">
                             <p className="font-medium">An Error Occurred</p>
                             <p className="text-sm mt-1">{uploadError}</p>
                           </div>
                           <button onClick={() => setUploadError(null)} className="p-1 hover:bg-red-100 rounded-full -m-1"><X className="h-4 w-4" /></button>
                         </div>
                    )}
                    {currentAnalysis ? <AnalysisDisplay /> : <FileUpload />}
                </main>
            </div>
            {currentAnalysis && (
                <button
                    onClick={resetStateForNewAnalysis}
                    className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50"
                    title="Analyze New Contract"
                >
                    <Plus className="h-6 w-6" />
                </button>
            )}
        </div>
    );
};

const ContractAnalyzer = () => (
    <AnalysisProvider>
        <MainLayout />
    </AnalysisProvider>
);

export default ContractAnalyzer;
