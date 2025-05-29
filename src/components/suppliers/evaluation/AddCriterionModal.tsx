import React, { useState } from 'react';
import { X, HelpCircle, Plus, AlertCircle } from 'lucide-react';

interface AddCriterionModalProps {
  categoryId: string;
  onClose: () => void;
  onSave: (criterion: {
    name: string;
    description: string;
    weight: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    scoringGuide?: {
      levels: Array<{
        score: number;
        description: string;
      }>;
    };
  }) => void;
}

const AddCriterionModal: React.FC<AddCriterionModalProps> = ({
  categoryId,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState(0);
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [showScoringGuide, setShowScoringGuide] = useState(false);
  const [scoringLevels, setScoringLevels] = useState<Array<{ score: number; description: string }>>([
    { score: 5, description: 'Exceeds all requirements' },
    { score: 3, description: 'Meets requirements' },
    { score: 1, description: 'Does not meet requirements' }
  ]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const errors: string[] = [];
    if (name.length < 3) errors.push('Name must be at least 3 characters');
    if (description.length < 10) errors.push('Description must be at least 10 characters');
    if (weight <= 0 || weight > 100) errors.push('Weight must be between 1 and 100');
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    onSave({
      name,
      description,
      weight: weight / 100,
      priority,
      scoringGuide: {
        levels: scoringLevels
      }
    });
  };

  const addScoringLevel = () => {
    setScoringLevels([...scoringLevels, { score: 0, description: '' }]);
  };

  const updateScoringLevel = (index: number, field: 'score' | 'description', value: string | number) => {
    const newLevels = [...scoringLevels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    setScoringLevels(newLevels);
  };

  const removeScoringLevel = (index: number) => {
    setScoringLevels(scoringLevels.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Add New Criterion</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Criterion Name
              </label>
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>
            {showHints && (
              <p className="text-xs text-gray-500 mb-2">
                Use clear, specific names that describe what is being evaluated
              </p>
            )}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Technical Expertise, Project Management Capability"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            {showHints && (
              <p className="text-xs text-gray-500 mb-2">
                Provide detailed explanation of what aspects should be evaluated
              </p>
            )}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe the specific requirements and expectations for this criterion..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (%)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              min="0"
              max="100"
              className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter weight (1-100)"
              required
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Scoring Guide
              </label>
              <button
                type="button"
                onClick={addScoringLevel}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Level
              </button>
            </div>
            {showHints && (
              <p className="text-xs text-gray-500 mb-2">
                Define clear scoring levels to ensure consistent evaluation
              </p>
            )}
            <div className="space-y-3">
              {scoringLevels.map((level, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-20">
                    <input
                      type="number"
                      value={level.score}
                      onChange={(e) => updateScoringLevel(index, 'score', Number(e.target.value))}
                      min="0"
                      max="5"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Score"
                    />
                  </div>
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={level.description}
                      onChange={(e) => updateScoringLevel(index, 'description', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Description for this score level"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeScoringLevel(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
            >
              Add Criterion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCriterionModal;