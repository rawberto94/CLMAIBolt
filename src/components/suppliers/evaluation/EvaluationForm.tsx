import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import type { EvaluationTemplate, VendorRating } from '../../../types/EvaluationCriteria';

interface EvaluationFormProps {
  template: EvaluationTemplate;
  onSave: (vendorRating: VendorRating) => void;
}

const RatingScale: React.FC<{
  value: number | null;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => {
  const ratings = [
    { value: 0, label: 'N/A' },
    { value: 1, label: 'Not Met' },
    { value: 2, label: 'Partially Met' },
    { value: 3, label: 'Meets Min' },
    { value: 4, label: 'Meets All' },
    { value: 5, label: 'Exceeds' },
    { value: 6, label: 'Far Exceeds' },
  ];

  return (
    <div className="flex items-center space-x-2">
      {ratings.map((rating) => (
        <button
          key={rating.value}
          onClick={() => onChange(rating.value)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 transform hover:scale-105
            ${value === rating.value
              ? 'bg-primary-600 text-white shadow-lg ring-2 ring-primary-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          title={rating.label}
        >
          {rating.value}
        </button>
      ))}
    </div>
  );
};

const EvaluationForm: React.FC<EvaluationFormProps> = ({ template, onSave }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [vendorName, setVendorName] = useState('');
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleRatingChange = (criterionId: string, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [criterionId]: value,
    }));
  };

  const calculateScore = () => {
    let totalScore = 0;
    let totalWeight = 0;

    template.mainCategories.forEach((category) => {
      category.subCategories.forEach((subCategory) => {
        subCategory.sections.forEach((section) => {
          section.criteria.forEach((criterion) => {
            const rating = ratings[criterion.id];
            if (rating !== undefined && rating !== 0) {
              totalScore += (rating / 6) * criterion.weight;
              totalWeight += criterion.weight;
            }
          });
        });
      });
    });

    return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
  };

  const handleSubmit = () => {
    if (!vendorName) {
      alert('Please enter a vendor name');
      return;
    }

    const vendorRating: VendorRating = {
      vendorId: Date.now().toString(),
      vendorName,
      ratings,
      totalScore: calculateScore(),
    };

    onSave(vendorRating);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Vendor Name</label>
        <input
          type="text"
          value={vendorName}
          onChange={(e) => setVendorName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Enter vendor name"
        />
      </div>

      <div className="space-y-4">
        {template.mainCategories.map((category) => (
          <div key={category.id} className="border rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => toggleCategory(category.id)}
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">Weight: {category.weight * 100}%</p>
              </div>
              {expandedCategories.includes(category.id) ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {expandedCategories.includes(category.id) && (
              <div className="p-4 space-y-6">
                {category.subCategories.map((subCategory) => (
                  <div key={subCategory.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-medium text-gray-900">{subCategory.name}</h4>
                      <span className="text-sm text-gray-500">
                        Weight: {subCategory.weight * 100}%
                      </span>
                    </div>

                    {subCategory.sections.map((section) => (
                      <div key={section.id} className="pl-4 border-l-2 border-gray-200">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">{section.name}</h5>
                        <div className="space-y-4">
                          {section.criteria.map((criterion) => (
                            <div key={criterion.id} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-900">
                                      {criterion.name}
                                    </span>
                                    <div className="ml-2 group relative">
                                      <HelpCircle className="h-4 w-4 text-gray-400" />
                                      <div className="hidden group-hover:block absolute z-10 w-64 p-2 bg-white rounded-lg shadow-lg border border-gray-200 text-xs text-gray-600">
                                        {criterion.description}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    Priority: {criterion.priority}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  Weight: {criterion.weight * 100}%
                                </span>
                              </div>
                              <RatingScale
                                value={ratings[criterion.id] ?? null}
                                onChange={(value) => handleRatingChange(criterion.id, value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="text-lg font-medium text-gray-900">Total Score</h4>
          <p className="text-sm text-gray-500">Based on weighted average of all criteria</p>
        </div>
        <div className="text-2xl font-bold text-primary-600">{calculateScore().toFixed(1)}%</div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Submit Evaluation
        </button>
      </div>
    </div>
  );
};

export default EvaluationForm;