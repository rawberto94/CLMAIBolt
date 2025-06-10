import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { CollapsibleSection } from '../ui/CollapsibleSection';

interface ComplianceSectionProps {
  compliance: AnalysisResult['compliance'];
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Compliant': return 'bg-green-100 text-green-800';
        case 'Partial': return 'bg-yellow-100 text-yellow-800';
        case 'Non-Compliant':
        case 'At Risk': 
            return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getScoreColor = (score: number) => {
    if (score >= 80) return "#10B981"; // green-500
    if (score >= 60) return "#F59E0B"; // amber-500
    return "#EF4444"; // red-500
}

export const ComplianceSection = ({ compliance }: ComplianceSectionProps) => {
  if (!compliance) return null;

  const score = compliance.score;
  const scoreColor = getScoreColor(score);

  return (
    <CollapsibleSection title="Compliance Analysis" icon={ShieldCheck} defaultOpen>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-lg">
            <div className="relative h-24 w-24">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={scoreColor} strokeWidth="3" strokeDasharray={`${score}, 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold" style={{ color: scoreColor }}>{score}</span>
                </div>
            </div>
            <h5 className="text-lg font-semibold text-gray-900 mt-3">Compliance Score</h5>
        </div>
        <div className="md:col-span-2">
            <h4 className="text-base font-semibold text-gray-800 mb-3">Compliance Requirements</h4>
            <div className="space-y-2">
                {compliance.requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-800">{req.category}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(req.status)}`}>
                            {req.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </CollapsibleSection>
  );
};
