import React from 'react';
import { BookOpen } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { CollapsibleSection } from '../ui/CollapsibleSection';

interface OverviewSectionProps {
  overview: AnalysisResult['overview'];
}

export const OverviewSection = ({ overview }: OverviewSectionProps) => {
  if (!overview) return null;

  return (
    <CollapsibleSection title="Contract Overview" icon={BookOpen} defaultOpen>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {/* Left Column: Key Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Contract Type:</span> <span className="font-medium text-gray-800">{overview.type}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Status:</span> <span className="font-medium text-green-600">{overview.status}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Effective Date:</span> <span className="font-medium text-gray-800">{overview.effectiveDate}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Expiration Date:</span> <span className="font-medium text-gray-800">{overview.expirationDate}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Total Value:</span> <span className="font-bold text-gray-900">{overview.totalValue}</span></div>
        </div>

        {/* Right Column: Parties and Description */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">Parties Involved</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              {overview.parties.map((party, index) => <li key={index}>{party}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
            <p className="text-sm text-gray-600">{overview.description}</p>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
};
