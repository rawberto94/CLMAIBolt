import React from 'react';
import { useAnalysisContext } from '@/context/AnalysisContext';
import { AnalysisScorecard } from './AnalysisScorecard';
import { CollapsibleSection } from '../ui/CollapsibleSection';

// Import icons for section headers
import { FileCheck, DollarSign, Zap, AlertTriangle, Shield, ListTodo } from 'lucide-react';

export const AnalysisDisplay = () => {
    const { currentAnalysis } = useAnalysisContext();

    // If there is no analysis data yet, show a message.
    if (!currentAnalysis) {
        return <div className="text-center text-gray-500 py-10">No analysis result to display.</div>;
    }

    // A helper function to format risk colors
    const getRiskColor = (risk?: string) => {
        switch (risk?.toLowerCase()) {
            case 'high': return 'text-red-700 bg-red-50 border-red-200';
            case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-green-700 bg-green-50 border-green-200';
            default: return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    };


    return (
        <div className="space-y-6">
            <header className="pb-4 border-b">
                <p className="text-sm text-gray-500">Analysis Result</p>
                <h2 className="text-2xl font-bold text-gray-800">{currentAnalysis.fileName}</h2>
            </header>
            
            <AnalysisScorecard score={currentAnalysis.score} />

            <CollapsibleSection title="Executive Summary" icon={FileCheck} defaultOpen>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {currentAnalysis.summary}
                </p>
            </CollapsibleSection>

            {currentAnalysis.financials && (
                <CollapsibleSection title="Financial Extracts" icon={DollarSign} defaultOpen>
                    <div className="space-y-2 text-sm">
                       <p><strong>Total Value:</strong> {currentAnalysis.financials.currency} {currentAnalysis.financials.totalContractValue}</p>
                       <p><strong>Liability Cap:</strong> {currentAnalysis.financials.currency} {currentAnalysis.financials.liabilityCap}</p>
                    </div>
                </CollapsibleSection>
            )}

            {currentAnalysis.risks?.length > 0 && (
                <CollapsibleSection title="Identified Risks" icon={AlertTriangle} defaultOpen>
                    <div className="space-y-3">
                        {currentAnalysis.risks.map((risk, index) => (
                             <div key={index} className={`p-3 rounded-md border ${getRiskColor(risk.level)}`}>
                                 <p className="font-semibold capitalize">{risk.level} Risk</p>
                                 <p className="text-sm mt-1">{risk.description}</p>
                                 {risk.mitigation && <p className="text-sm mt-2 text-gray-600"><strong>Mitigation:</strong> {risk.mitigation}</p>}
                             </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}
            
            {currentAnalysis.keyFindings?.length > 0 && (
                <CollapsibleSection title="Key Findings" icon={Zap}>
                     <div className="space-y-3">
                        {currentAnalysis.keyFindings.map((finding, index) => (
                             <div key={index} className={`p-3 rounded-md border ${getRiskColor(finding.risk)}`}>
                                 <p className="font-semibold">{finding.label}</p>
                                 <p className="text-sm mt-1">{finding.value}</p>
                             </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}
            
            {currentAnalysis.recommendations?.length > 0 && (
                 <CollapsibleSection title="Recommendations" icon={Shield}>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {currentAnalysis.recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
                    </ul>
                 </CollapsibleSection>
            )}
        </div>
    );
};
