import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import { useAnalysisContext } from '../../contexts/AnalysisContext';
import { handleAnalysisRequest } from '../../services/contractRagService';
import { AnalysisProgress } from '../../types';

export const FileUpload = () => {
    const { setIsAnalyzing, setUploadError, setCurrentAnalysis, setAnalyses, isAnalyzing } = useAnalysisContext();
    const [file, setFile] = useState<File | null>(null);
    const [selectedTaxonomy, setSelectedTaxonomy] = useState<string>('');
    const [progress, setProgress] = useState<AnalysisProgress>({ status: 'idle', percentage: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (selectedFiles: FileList | null) => {
        if (selectedFiles && selectedFiles.length > 0) {
            setFile(selectedFiles[0]);
            setUploadError(null); // Clear previous errors on new file selection
        }
    };

    const analyze = async () => {
        if (!file || !selectedTaxonomy) {
            setUploadError("Please select a file and a category.");
            return;
        }
        setIsAnalyzing(true);
        setUploadError(null);
        setProgress({ status: 'idle', percentage: 0 });

        try {
            const newAnalysis = await handleAnalysisRequest(file, selectedTaxonomy, setProgress);
            setCurrentAnalysis(newAnalysis);
            setAnalyses(prev => [newAnalysis, ...prev.filter(a => a.id !== newAnalysis.id)]);
        } catch (error) {
            console.error("Analysis failed in component:", error);
            setUploadError(error instanceof Error ? error.message : "An unexpected error occurred.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 cursor-pointer hover:border-blue-500 transition-all"
                onClick={() => fileInputRef.current?.click()}
            >
                <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e.target.files)} accept=".pdf,.doc,.docx,.txt" />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="font-medium text-gray-800">
                    {file ? `Selected: ${file.name}` : 'Click to Upload or Drag & Drop'}
                </p>
                <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX, or TXT</p>
            </div>

            <select
                value={selectedTaxonomy}
                onChange={(e) => setSelectedTaxonomy(e.target.value)}
                disabled={isAnalyzing}
                className="block w-full p-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md mb-6 disabled:opacity-50"
            >
                <option value="" disabled>Select a contract category...</option>
                <option value="IT Services">IT Services</option>
                <option value="MSA">Master Service Agreement</option>
                <option value="NDA">Non-Disclosure Agreement</option>
                <option value="Sales Agreement">Sales Agreement</option>
                <option value="Lease Agreement">Lease Agreement</option>
            </select>
            
            <div className="text-center">
                <button onClick={analyze} disabled={!file || !selectedTaxonomy || isAnalyzing} className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-md font-medium transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {isAnalyzing ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing...</> : <><Sparkles className="h-5 w-5" /> Analyze Contract</>}
                </button>
                {isAnalyzing && (
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 capitalize">{progress.status.replace(/_/g, ' ')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
