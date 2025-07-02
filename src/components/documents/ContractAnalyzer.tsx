import React from 'react';
import { useState, useEffect } from 'react';
// Corrected relative paths below
import { AnalysisProvider, useAnalysisContext } from '../../contexts/AnalysisContext';
import { checkAIServiceHealth } from '../../services/aiService';
import { FileUpload } from '../contract-analyzer/FileUpload';
import { AnalysisDisplay } from '../contract-analyzer/AnalysisDisplay';
// Icons
import { FileSearch, CheckCircle, RefreshCw, AlertTriangle, X, Plus, Zap } from 'lucide-react';

type InitializationStatus = 'idle' | 'initializing' | 'success' | 'error';

const MainLayout = () => {
    const { 
        currentAnalysis, 
        uploadError, 
        setUploadError, 
        resetStateForNewAnalysis,
        analysisProgress,
        isAnalyzing,
        canRetry,
        retryAnalysis
    } = useAnalysisContext();
    const [initStatus, setInitStatus] = useState<InitializationStatus>('idle');
    const [initError, setInitError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const init = async () => {
            setInitStatus('initializing');
            setInitError(null);
            
            try {
                console.log('Checking AI service health...');
                const isHealthy = await checkAIServiceHealth();
                
                if (!isHealthy) {
                    throw new Error('AI service is not available or not properly configured');
                }
                
                setInitStatus('success');
                console.log('AI service initialized successfully');
            } catch (error) {
                console.error("AI service initialization failed:", error);
                const errorMessage = error instanceof Error ? error.message : "Failed to initialize the AI analysis engine.";
                setInitError(errorMessage);
                setInitStatus('error');
                setUploadError(errorMessage);
            }
        };
        
        init();
    }, [setUploadError, retryCount]);

    const handleRetryInitialization = () => {
        setRetryCount(prev => prev + 1);
    };

    const getStatusIcon = () => {
        switch (initStatus) {
            case 'initializing':
                return <RefreshCw className="h-4 w-4 animate-spin" />;
            case 'success':
                return <CheckCircle className="h-4 w-4" />;
            case 'error':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Zap className="h-4 w-4" />;
        }
    };

    const getStatusText = () => {
        switch (initStatus) {
            case 'initializing':
                return 'Initializing AI Engine...';
            case 'success':
                return 'AI Engine Ready';
            case 'error':
                return 'Initialization Failed';
            default:
                return 'Starting...';
        }
    };

    const getStatusColor = () => {
        switch (initStatus) {
            case 'initializing':
                return 'text-blue-600';
            case 'success':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-gray-500';
        }
    };

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
                            <span className={`flex items-center gap-1.5 text-sm ${getStatusColor()}`}>
                                {getStatusIcon()}
                                {getStatusText()}
                            </span>
                            {initStatus === 'error' && (
                                <button
                                    onClick={handleRetryInitialization}
                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Retry
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Progress indicator for initialization or analysis */}
                    {(initStatus === 'initializing' || isAnalyzing) && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                    style={{ 
                                        width: isAnalyzing && analysisProgress 
                                            ? `${analysisProgress.percentage}%` 
                                            : '60%' 
                                    }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {isAnalyzing && analysisProgress?.message 
                                    ? analysisProgress.message 
                                    : 'Loading AI models and preparing analysis engine...'
                                }
                            </p>
                        </div>
                    )}
                </header>

                <main className="p-4 sm:p-6">
                    {/* Initialization Error */}
                    {initError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-3 text-red-700">
                                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium">Initialization Error</p>
                                    <p className="text-sm mt-1">{initError}</p>
                                    <div className="mt-2 flex gap-2">
                                        <button 
                                            onClick={handleRetryInitialization}
                                            className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors"
                                        >
                                            Retry Initialization
                                        </button>
                                        {canRetry && (
                                            <button 
                                                onClick={retryAnalysis}
                                                className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
                                                disabled={isAnalyzing}
                                            >
                                                Retry Analysis
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setInitError(null)} 
                                    className="p-1 hover:bg-red-100 rounded-full -m-1"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Upload Error */}
                    {uploadError && uploadError !== initError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
                            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-medium">Upload Error</p>
                                <p className="text-sm mt-1">{uploadError}</p>
                            </div>
                            <button 
                                onClick={() => setUploadError(null)} 
                                className="p-1 hover:bg-red-100 rounded-full -m-1"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Disable functionality if not initialized or if analyzing */}
                    <div className={initStatus !== 'success' || isAnalyzing ? 'opacity-50 pointer-events-none' : ''}>
                        {currentAnalysis ? <AnalysisDisplay /> : <FileUpload />}
                    </div>

                    {/* Overlay for non-initialized state or analysis in progress */}
                    {(initStatus === 'initializing' || isAnalyzing) && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
                            <div className="text-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                                <p className="text-gray-600">
                                    {isAnalyzing 
                                        ? (analysisProgress?.message || 'Analyzing contract with AI...')
                                        : 'Preparing AI analysis engine...'
                                    }
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {isAnalyzing 
                                        ? `${analysisProgress?.percentage || 0}% complete`
                                        : 'This may take a few moments'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Floating Action Button - only show when ready and analysis exists */}
            {currentAnalysis && initStatus === 'success' && (
                <button
                    onClick={resetStateForNewAnalysis}
                    className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50 group"
                    title="Analyze New Contract"
                >
                    <Plus className="h-6 w-6" />
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Analyze New Contract
                    </span>
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
