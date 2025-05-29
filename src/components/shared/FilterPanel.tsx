import React from 'react';
import { Filter, ChevronUp, ChevronDown, Calendar, Tag, Users } from 'lucide-react';
import TaxonomyFilter from './TaxonomyFilter';

interface FilterOption {
  id: string;
  label: string;
  group?: string;
  metadata?: string;
}

interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  type: 'checkbox' | 'radio';
}

interface DateRange {
  start: string;
  end: string;
}

interface SortOption {
  field: string;
  label: string;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filterGroups: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (groupId: string, selectedOptions: string[]) => void;
  selectedL1: string[];
  selectedL2: string[];
  onL1Change: (categories: string[]) => void;
  onL2Change: (categories: string[]) => void;
  sortOptions?: SortOption[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (field: string) => void;
  onSortDirectionChange?: () => void;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  onReset?: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  filterGroups,
  selectedFilters,
  onFilterChange,
  selectedL1,
  selectedL2,
  onL1Change,
  onL2Change,
  sortOptions,
  sortField,
  sortDirection,
  onSortChange,
  onSortDirectionChange,
  dateRange,
  onDateRangeChange,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-floating bg-white border border-gray-100 z-10 animate-fade-in">
      <div className="py-1 p-5" role="menu">
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
          <TaxonomyFilter
            selectedL1={selectedL1}
            selectedL2={selectedL2}
            onL1Change={onL1Change}
            onL2Change={onL2Change}
            className="w-full"
          />
        </div>

        {sortOptions && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Sort By</h3>
            <select
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 hover:border-primary-300 py-2.5"
              value={sortField}
              onChange={(e) => onSortChange?.(e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.field} value={option.field}>
                  {option.label}
                </option>
              ))}
            </select>
            {sortField && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={onSortDirectionChange}
                  className="text-sm text-gray-600 hover:text-primary-700 flex items-center transition-colors duration-200 font-medium"
                >
                  {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                  {sortDirection === 'asc' ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {dateRange && onDateRangeChange && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Date Range</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 hover:border-primary-300 py-2"
                  value={dateRange.start}
                  onChange={(e) =>
                    onDateRangeChange({ ...dateRange, start: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 hover:border-primary-300 py-2"
                  value={dateRange.end}
                  onChange={(e) =>
                    onDateRangeChange({ ...dateRange, end: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {filterGroups.map((group) => (
          <div key={group.id} className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">{group.label}</h3>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2">
              {group.options.map((option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    type={group.type}
                    id={`${group.id}-${option.id}`}
                    name={group.id}
                    value={option.id}
                    checked={selectedFilters[group.id]?.includes(option.id)}
                    onChange={(e) => {
                      if (group.type === 'radio') {
                        onFilterChange(group.id, [e.target.value]);
                      } else {
                        const currentSelected = selectedFilters[group.id] || [];
                        onFilterChange(
                          group.id,
                          e.target.checked
                            ? [...currentSelected, option.id]
                            : currentSelected.filter(id => id !== option.id)
                        );
                      }
                    }}
                    className={`${
                      group.type === 'checkbox'
                        ? 'rounded'
                        : 'rounded-full'
                    } border-gray-300 text-primary-600 focus:ring-primary-500`}
                  />
                  <label
                    htmlFor={`${group.id}-${option.id}`}
                    className="ml-2 text-sm text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    {option.label}
                    {option.metadata && (
                      <span className="ml-1 text-xs text-gray-500">
                        ({option.metadata})
                      </span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-5 border-t border-gray-200 flex justify-between">
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
          >
            Reset All
          </button>
          <div className="space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-sm"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;