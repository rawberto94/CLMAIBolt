import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  details?: {
    label: string;
    value: string;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon, details }) => {
  return (
    <div className="bg-white rounded-xl shadow-card p-6 transition-all duration-300 hover:shadow-card-hover border border-gray-100 hover:translate-y-[-2px]">
      <div className="flex justify-between items-start mb-1">
        <div>
          <p className="text-sm font-medium text-gray-600 tracking-wide">{title}</p>
          <p className="mt-3 text-3xl font-bold text-gray-900 font-heading">{value}</p>
          <div className="mt-2.5 flex items-center">
            {changeType === 'increase' ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1.5" />
            ) : changeType === 'decrease' ? (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1.5" />
            ) : null}
            <p
              className={`text-sm font-medium ${
                changeType === 'increase'
                  ? 'text-green-600'
                  : changeType === 'decrease'
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              {change} from last month
            </p>
          </div>
        </div>
        <div className="p-3.5 bg-primary-50 rounded-full shadow-subtle">{icon}</div>
      </div>
      {details && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">{details.label}</span>
            <span className="font-semibold text-gray-900">{details.value}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;