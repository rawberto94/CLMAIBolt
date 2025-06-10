import React from 'react';
import { ThumbsUp } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { CollapsibleSection } from '../ui/CollapsibleSection';

// Define the props that this component will accept
interface RecommendationsSectionProps {
  recommendations: AnalysisResult['recommendations'];
}

// Helper function to get styling for priority/effort tags
const getTagStyles = (level: 'High' | 'Medium' | 'Low') => {
  switch (level) {
    case 'High':
      return 'bg-red-100 text-red-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'Low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const RecommendationsSection = ({ recommendations }: RecommendationsSectionProps) => {
  // If there are no recommendations, don't render the section
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <CollapsibleSection title="Actionable Recommendations" icon={ThumbsUp} defaultOpen>
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div key={index} className="border bg-white rounded-lg p-4 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start">
              <p className="text-base text-gray-800 flex-1 pr-4">{rec.description}</p>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getTagStyles(rec.priority)}`}>
                {rec.priority} Priority
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <p className="font-medium text-gray-600">Benefit:</p>
                <p className="text-gray-700">{rec.benefit}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Implementation Effort:</p>
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${getTagStyles(rec.effort)}`}>
                  {rec.effort}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
};
