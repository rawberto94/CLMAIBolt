import React, 'react';
import { useState, useEffect } from 'react';
import { FileSearch, CheckCircle, RefreshCw, AlertTriangle, X, Plus, Settings } from 'lucide-react';
import { AnalysisProvider, useAnalysisContext } from '@/context/AnalysisContext';
import { initializeContractRAG } from '@/services/contractRagService';

// ==================================================================
// The import paths below have been corrected based on your file structure
// They now go up from 'tools' and then down into 'components'
// ==================================================================
import { FileUpload } from '../components/contract-analyzer/FileUpload';
import { AnalysisDisplay } from '../components/contract-analyzer/AnalysisDisplay';
import { ChatPanel } from '../components/contract-analyzer/ChatPanel';
import { HistoryTab } from '../components/contract-analyzer/HistoryTab';
import { SettingsModal } from '../components/contract-analyzer/SettingsModal';
import { TABS } from '../components/contract-analyzer/tabsConfig';
// ==================================================================


const MainLayout = () => {
    const { activeTab, setActiveTab, currentAnalysis, uploadError, setUploadError, resetStateForNewAnalysis } = useAnalysisContext();
    const [isInitializing, setIsInitializing] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
        if (activeTab === 'chat') {
             // We will build the ChatPanel component in a future step
            return currentAnalysis ? <p>Chat feature coming soon!</p> : <p>Analyze a contract to start chatting.</p>;
        }
        if (activeTab === 'history') {
            // We will build the HistoryTab component in a future step
            return <p>History feature coming soon!</p>;
        }
        
        return <FileUpload />;
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
                            <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-gray-500 hover:text-gray-700"><Settings className="h-5 w-5" /></button>
                        </div>
                    </div>
                </header>

                {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}

                <nav className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            disabled={tab.requiresAnalysis && !currentAnalysis}
                            className={`px-4 py-3 text-sm font-medium capitalize transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <main className="p-4 sm:p-6">
                    {uploadError && (
                         <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3 text-red-700">
                           <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                           <div className="flex-1">
                             <p className="font-medium">An Error Occurred</p>
                             <p className="text-sm mt-1">{uploadError}</p>
                           </div>
                           <button onClick={() => setUploadError(null)} className="p-1 hover:bg-red-100 rounded-full -m-1"><X className="h-4 w-4" /></button>
                         </div>
                    )}
                    {renderTabContent()}
                </main>
            </div>

             {(currentAnalysis || activeTab !== 'analyze') && (
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


const ContractRagAnalyzer = () => (
    <AnalysisProvider>
        <MainLayout />
    </AnalysisProvider>
);

export default ContractRagAnalyzer;
