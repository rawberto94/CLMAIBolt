import React from 'react';
import { useState, useEffect } from 'react';
import { FileSearch, CheckCircle, RefreshCw, AlertTriangle, X, Plus, Settings } from 'lucide-react';
import { AnalysisProvider, useAnalysisContext } from '@/context/AnalysisContext';
import { initializeContractRAG } from '@/services/contractRagService';
import { FileUpload } from './FileUpload'; // Assuming FileUpload is also in this folder
import { AnalysisDisplay } from './AnalysisDisplay'; // Assuming AnalysisDisplay is here too
import { TABS } from './tabsConfig'; // Assuming tabsConfig is also here

// If your other components are in a different folder, we'll need to adjust the paths above.
// For now, let's assume they will also live inside 'src/components/documents/'

const MainLayout = () => {
    const { activeTab, setActiveTab, currentAnalysis, uploadError, setUploadError, resetStateForNewAnalysis } = useAnalysisContext();
    const [isInitializing, setIsInitializing] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // State for settings modal

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

    const renderTabContent = () => {
        if (activeTab === 'analyze') {
            return currentAnalysis ? <AnalysisDisplay /> : <FileUpload />;
        }
        // Add placeholders for other tabs as needed
        return <p>Select a tab</p>;
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
            <div className="bg-white rounded-lg shadow-lg min-h-[80vh]">
                <header className="p-4 sm:p-6 border-b border-gray-200">
                     <div className="flex items-center justify-between">
                        <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
                            <FileSearch className="h-6 w-6 text-blue-600" /> AI Contract Analyzer
                        </h2>
                        <div className="flex items-center gap-3">
                            {isInitializing && <span className="flex items-center gap-1 text-sm text-blue-600 animate-pulse"><RefreshCw className="h-4 w-4 animate-spin" />Initializing...</span>}
                            {isInitialized && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" />System Ready</span>}
                            {/* We can add the SettingsModal logic back here if needed */}
                            <button className="p-2 text-gray-500 hover:text-gray-700"><Settings className="h-5 w-5" /></button>
                        </div>
                    </div>
                </header>

                <nav className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
                    {/* Placeholder for TABS logic */}
                </nav>

                <main className="p-4 sm:p-6">
                    {uploadError && (
                         <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                           <p className="font-medium text-red-700">{uploadError}</p>
                         </div>
                    )}
                    {renderTabContent()}
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

// Main component to be exported
const ContractAnalyzer = () => (
    <AnalysisProvider>
        <MainLayout />
    </AnalysisProvider>
);

export default ContractAnalyzer;
