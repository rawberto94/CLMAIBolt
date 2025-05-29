import React from 'react';
import { X } from 'lucide-react';

interface ScoreGuideModalProps {
  onClose: () => void;
}

const ScoreGuideModal: React.FC<ScoreGuideModalProps> = ({ onClose }) => {
  const scoreGuides = [
    { score: 5, label: 'Excellent', description: 'Exceeds all requirements with exceptional quality', color: 'bg-green-100 text-green-800' },
    { score: 4, label: 'Good', description: 'Meets all requirements with above-average quality', color: 'bg-blue-100 text-blue-800' },
    { score: 3, label: 'Satisfactory', description: 'Meets basic requirements adequately', color: 'bg-yellow-100 text-yellow-800' },
    { score: 2, label: 'Fair', description: 'Partially meets requirements with some deficiencies', color: 'bg-orange-100 text-orange-800' },
    { score: 1, label: 'Poor', description: 'Falls significantly short of requirements', color: 'bg-red-100 text-red-800' },
    { score: 0, label: 'N/A', description: 'Not applicable or cannot be evaluated', color: 'bg-gray-100 text-gray-800' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Scoring Guide</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {scoreGuides.map(({ score, label, description, color }) => (
              <div key={score} className="flex items-start p-4 bg-gray-50 rounded-lg">
                <div className={`flex-shrink-0 w-12 h-12 ${color} rounded-full flex items-center justify-center mr-4`}>
                  <span className="text-xl font-bold">{score}</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{label}</h3>
                  <p className="text-gray-600 mt-1">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreGuideModal;