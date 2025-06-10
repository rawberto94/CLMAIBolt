import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { CollapsibleSection } from '../ui/CollapsibleSection';

// Define the props that this component will accept
interface RisksSectionProps {
  risks: AnalysisResult['risks'];
}

// Helper function to get styling based on risk severity
const getSeverityStyles = (severity: 'High' | 'Medium' | 'Low') => {
  switch (severity) {
    case 'High':
      return {
        border: 'border-red-500',
        bg: 'bg-red-50',
        text: 'text-red-800',
        tagBg: 'bg-red-100',
      };
    case 'Medium':
      return {
        border: 'border-yellow-500',
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        tagBg: 'bg-yellow-100',
      };
    case 'Low':
      return {
        border: 'border-green-500',
        bg: 'bg-green-50',
        text: 'text-green-800',
        tagBg: 'bg-green-100',
      };
    default:
      return {
        border: 'border-gray-300',
        bg: 'bg-gray-50',
        text: 'text-gray-800',
        tagBg: 'bg-gray-100',
      };
  }
};

export const RisksSection = ({ risks }: RisksSectionProps) => {
  // If there are no risks, don't render anything for this section
  if (!risks || risks.length === 0) {
    return null;
  }

  return (
    <CollapsibleSection title="Risk Analysis" icon={AlertTriangle} defaultOpen>
      <div className="space-y-4">
        {risks.map((risk, index) => {
          const styles = getSeverityStyles(risk.severity);
          return (
            <div key={index} className={`border-l-4 p-4 rounded-r-lg ${styles.border} ${styles.bg}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`font-semibold text-base ${styles.text}`}>{risk.category} Risk</p>
                  <p className="mt-1 text-gray-700">{risk.description}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.tagBg} ${styles.text}`}>
                  {risk.severity}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="font-medium text-gray-600">Potential Impact:</p>
                  <p className="text-gray-700">{risk.impact}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Suggested Mitigation:</p>
                  <p className="text-gray-700">{risk.mitigation}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
};
