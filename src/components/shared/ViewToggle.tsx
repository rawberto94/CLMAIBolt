import React from 'react';

interface ViewOption {
  id: string;
  label: string;
}

interface ViewToggleProps {
  options: ViewOption[];
  activeView: string;
  onChange: (view: string) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ options, activeView, onChange }) => {
  return (
    <div className="flex rounded-lg shadow-sm">
      {options.map((option, index) => (
        <button
          key={option.id}
          className={`px-5 py-2.5 text-sm font-medium ${
            activeView === option.id
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-primary-700'
          } border border-gray-300 ${
            index === 0 ? 'rounded-l-lg' : ''
          } ${
            index === options.length - 1 ? 'rounded-r-lg' : ''
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200`}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ViewToggle;