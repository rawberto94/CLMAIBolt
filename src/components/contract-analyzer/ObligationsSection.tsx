import React from 'react';
import { ListTodo } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { CollapsibleSection } from '../ui/CollapsibleSection';

interface ObligationsSectionProps {
  obligations: AnalysisResult['obligations'];
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'On Track': return 'bg-green-100 text-green-800';
        case 'At Risk': return 'bg-yellow-100 text-yellow-800';
        case 'Delayed': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export const ObligationsSection = ({ obligations }: ObligationsSectionProps) => {
  if (!obligations) return null;

  return (
    <CollapsibleSection title="Deliverables & Obligations" icon={ListTodo} defaultOpen>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-base font-semibold text-gray-800 mb-3">Key Deliverables</h4>
          <div className="space-y-3">
            {obligations.deliverables.map((item, index) => (
              <div key={index} className="bg-slate-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-800">{item.description}</p>
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Deadline: {item.deadline}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-base font-semibold text-gray-800 mb-3">Service Level Agreement</h4>
           <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Availability:</span> <span className="font-medium text-gray-800">{obligations.serviceLevel.availability}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Critical Response:</span> <span className="font-medium text-gray-800">{obligations.serviceLevel.responseTime.critical}</span></div>
              <p className="text-gray-600 pt-1">Penalties: <span className="font-medium text-gray-800">{obligations.serviceLevel.penalties}</span></p>
            </div>
        </div>
      </div>
    </CollapsibleSection>
  );
};
