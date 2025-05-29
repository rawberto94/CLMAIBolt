import React from 'react';
import { Filter } from 'lucide-react';

interface FilterButtonProps {
  onClick: () => void;
  activeFiltersCount: number;
}

const FilterButton: React.FC<FilterButtonProps> = ({ onClick, activeFiltersCount }) => {
  return (
    <button
      className="w-full md:w-auto flex items-center justify-center px-5 py-2.5 border border-gray-300 rounded-lg shadow-subtle text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
      onClick={onClick}
    >
      <Filter className="h-4 w-4 mr-2" />
      Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
    </button>
  );
};

export default FilterButton;