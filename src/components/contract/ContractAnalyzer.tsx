import React, { useState, useRef } from 'react';
import { handleAnalysisRequest } from '../services/aiService';
import { 
  FileText, Upload, Zap, CheckCircle, X, RefreshCw, AlertTriangle, Download,
  DollarSign, Calendar, Shield, AlertCircle, BarChart2, ChevronDown, ChevronUp,
  Clock, Info
} from 'lucide-react';

// Type from backend schema
interface AnalysisResult {
  overview: { title: string; type: string; status: string; parties: string[]; effectiveDate: string; expirationDate: string; totalValue: string; description: string };
  financials: { totalValue: number; currency: string; paymentTerms: { schedule: string; terms: string; latePaymentFee: string; earlyPaymentDiscount: string }; rateCards: { role: string; rate: number; unit: string }[]; fees: { type: string; description: string; cap: string }[]; invoicingFrequency: string; budgetAllocation: { year1: number; year2: number; year3: number }; benchmarkComparison: { averageRates: { industry: number; ourAnalysis: number; variance: number }; paymentTerms: { industry: string; ourAnalysis: string; variance: string } } };
  obligations: { deliverables: { description: string; deadline: string; status: string }[]; serviceLevel: { availability: string; responseTime: { critical: string; high: string; medium: string; low: string }; penalties: string }; reporting: { frequency: string; contents: string[] }; keyPersonnel: { role: string; replaceability: string }[] };
  risks: { category: string; description: string; severity: string; impact: string; mitigation: string }[];
  compliance: { score: number; requirements: { category: string; status: string; details: string }[]; industryRegulations: { name: string; status: string; details: string }[] };
  recommendations: { priority: string; description: string; benefit: string; effort: string }[];
  benchmarks: { rateComparison: { averageRate: number; marketAverage: number; percentile: number }; termComparison: { paymentTerms: { contract: string; marketAverage: string; status: string }; contractLength: { contract: string; marketAverage: string; status: string }; terminationNotice: { contract: string; marketAverage: string; status: string } } };
}

const ContractAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true, financials: true, obligations: true, risks: true, compliance: true, recommendations: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProgress = (progress) => {
    setUploadProgress(progress.percentage);
    if (progress.status === 'error') setUploadError(progress.message);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setUploadError(null);
    try {
      const result = await handleAnalysisRequest(file, 'standard', handleProgress);
      setAnalysisResult(result);
      setAnalysisComplete(true);
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add other functions from demo: toggleSection, handleExportAnalysis (update to export backend JSON), getSeverityColor, etc.
  // Rendering code from demo here, replacing mock with analysisResult
  // For example:
  return (
    <div className="space-y-6">
      {/* Upload UI from demo */}
      {analysisComplete && analysisResult && (
        <div>
          {/* Render sections like in demo, using analysisResult.overview, etc. */}
        </div>
      )}
    </div>
  );
};

export default ContractAnalyzer;
