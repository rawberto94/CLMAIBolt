import React from 'react';
import { X } from 'lucide-react';
import EvaluationForm from './EvaluationForm';
import type { EvaluationTemplate, VendorRating } from '../../../types/EvaluationCriteria';

interface EvaluationModalProps {
  onClose: () => void;
  onSave: (vendorRating: VendorRating) => void;
}

// Example template data
const sampleTemplate: EvaluationTemplate = {
  id: 'template1',
  name: 'Standard Supplier Evaluation',
  description: 'Comprehensive supplier evaluation template',
  mainCategories: [
    {
      id: 'cat1',
      name: 'Vendor Information',
      description: 'Basic vendor information and profile',
      weight: 0.05,
      subCategories: [
        {
          id: 'subcat1',
          name: 'Company Profile',
          description: 'General company information',
          weight: 0.015,
          sections: [
            {
              id: 'sec1',
              name: 'Basic Information',
              description: 'Company details and documentation',
              criteria: [
                {
                  id: 'crit1',
                  name: 'Company Profile Completeness',
                  description: 'All required company information is provided',
                  priority: 'MUST',
                  weight: 0.005,
                  rating: null,
                },
                {
                  id: 'crit2',
                  name: 'Financial Stability',
                  description: 'Financial records and stability indicators',
                  priority: 'MUST',
                  weight: 0.01,
                  rating: null,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'cat2',
      name: 'Product Requirements',
      description: 'Product quality and specifications',
      weight: 0.5,
      subCategories: [
        {
          id: 'subcat2',
          name: 'Quality Standards',
          description: 'Product quality requirements',
          weight: 0.2,
          sections: [
            {
              id: 'sec2',
              name: 'Quality Certifications',
              description: 'Required quality certifications',
              criteria: [
                {
                  id: 'crit3',
                  name: 'ISO Certification',
                  description: 'Valid ISO certification',
                  priority: 'MUST',
                  weight: 0.1,
                  rating: null,
                },
                {
                  id: 'crit4',
                  name: 'Quality Control Process',
                  description: 'Documented quality control procedures',
                  priority: 'TARGET',
                  weight: 0.1,
                  rating: null,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  vendors: [],
};

const EvaluationModal: React.FC<EvaluationModalProps> = ({ onClose, onSave }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 transform transition-all duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Supplier Evaluation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <EvaluationForm template={sampleTemplate} onSave={onSave} />
        </div>
      </div>
    </div>
  );
};

export default EvaluationModal;