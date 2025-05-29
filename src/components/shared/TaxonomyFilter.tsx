import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';

export const CATEGORIES = {
  'Banking Services': ['Market Data Services', 'Banking Fees', 'Post Trade Services', 'Banking Services/Undefined', 'Trading Venues'],
  'HR Services': ['HR', 'Contractors'],
  'IT': ['Software', 'Hardware', 'Telco', 'Infrastructure Services', 'IT/Undefined'],
  'Logistics': ['Transportation Services', 'Consumables', 'Warehousing Services'],
  'Marketing': ['Communication & Research', 'Brand, Creative & Content', 'Media & MarTech', 'Live Marketing & Sponsorships', 'Marketing Materials', 'Marketing/Undefined'],
  'Non - Addressable': ['Employee vendors', 'Other not addressable', 'Intercompany'],
  'Outsourcing & Offshoring': ['Application Services (FKA ITO)', 'Business Process Outsourcing'],
  'Professional Services': ['Consulting', 'Legal Services', 'Insurances', 'Translation Services', 'Professional Services/Undefined'],
  'Real Estate & Facilities Management': ['Facilities Management', 'Real Estate', 'Utilities', 'Office supplies & Furniture', 'Real Estate & Facilities Management/Undefined'],
  'Travel': ['Transportation Ground', 'Accommodations', 'Travel Management', 'Transportation Air Travel', 'Travel/Undefined'],
  'Undefined': ['Undefined/Undefined']
};

interface TaxonomyFilterProps {
  selectedL1: string[];
  selectedL2: string[];
  onL1Change: (categories: string[]) => void;
  onL2Change: (categories: string[]) => void;
  className?: string;
}

const TaxonomyFilter: React.FC<TaxonomyFilterProps> = ({
  selectedL1,
  selectedL2,
  onL1Change,
  onL2Change,
  className = ''
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleL1Change = (category: string, checked: boolean) => {
    const newL1 = checked 
      ? [...selectedL1, category]
      : selectedL1.filter(c => c !== category);
    
    onL1Change(newL1);
    
    // Clear L2 selections for unchecked L1 categories
    if (!checked) {
      const l2ToRemove = CATEGORIES[category];
      onL2Change(selectedL2.filter(l2 => !l2ToRemove.includes(l2)));
    }
  };

  const handleL2Change = (category: string, checked: boolean) => {
    const newL2 = checked 
      ? [...selectedL2, category]
      : selectedL2.filter(c => c !== category);
    
    onL2Change(newL2);
    
    // Ensure parent L1 is selected when selecting an L2
    if (checked) {
      const parentL1 = Object.entries(CATEGORIES).find(([_, l2s]) => l2s.includes(category))?.[0];
      if (parentL1 && !selectedL1.includes(parentL1)) {
        onL1Change([...selectedL1, parentL1]);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setFilterOpen(!filterOpen)}
        className="flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-subtle hover:bg-gray-50 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
      >
        <Filter className="h-4 w-4 mr-2" />
        Category Filter
        {(selectedL1.length > 0 || selectedL2.length > 0) && (
          <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {selectedL1.length + selectedL2.length}
          </span>
        )}
      </button>

      {filterOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-floating border border-gray-100 z-50 animate-fade-in">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-5 font-heading">Category Filter</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(CATEGORIES).map(([l1, l2Categories]) => (
                <div key={l1} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={selectedL1.includes(l1)}
                        onChange={(e) => handleL1Change(l1, e.target.checked)}
                      />
                      <span className="ml-2 text-sm font-medium text-gray-900 hover:text-primary-700 transition-colors duration-200">{l1}</span>
                    </label>
                    <button
                      onClick={() => toggleCategory(l1)}
                      className="text-gray-400 hover:text-primary-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                    >
                      {expandedCategories.includes(l1) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  {expandedCategories.includes(l1) && (
                    <div className="ml-6 space-y-2 pl-2 border-l-2 border-gray-100">
                      {l2Categories.map(l2 => (
                        <label key={l2} className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={selectedL2.includes(l2)}
                            onChange={(e) => handleL2Change(l2, e.target.checked)}
                          />
                          <span className="ml-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">{l2}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onL1Change([]);
                  onL2Change([]);
                }}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
              >
                Clear All
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxonomyFilter;