import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ComplianceItem {
  id: string;
  category: string;
  issues: number;
  totalChecks: number;
  status: 'compliant' | 'at-risk' | 'non-compliant';
}

const complianceData: ComplianceItem[] = [
  {
    id: 'gdpr',
    category: 'GDPR',
    issues: 1,
    totalChecks: 18,
    status: 'at-risk',
  },
  {
    id: 'hipaa',
    category: 'HIPAA',
    issues: 0,
    totalChecks: 12,
    status: 'compliant',
  },
  {
    id: 'sox',
    category: 'SOX',
    issues: 3,
    totalChecks: 15,
    status: 'non-compliant',
  },
  {
    id: 'ccpa',
    category: 'CCPA',
    issues: 0,
    totalChecks: 10,
    status: 'compliant',
  },
];

const ComplianceStatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'compliant':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'non-compliant':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'at-risk':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    default:
      return null;
  }
};

const ComplianceOverview: React.FC = () => {
  return (
    <div className="space-y-4">
      {complianceData.map((item) => (
        <div key={item.id} className="flex items-center p-3 border rounded-lg">
          <ComplianceStatusIcon status={item.status} />
          <div className="ml-4 flex-grow">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-900">{item.category}</span>
              <span className="text-sm text-gray-500">
                {item.issues} issues / {item.totalChecks} checks
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className={`h-2.5 rounded-full ${
                  item.status === 'compliant'
                    ? 'bg-green-500'
                    : item.status === 'at-risk'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.round(
                    ((item.totalChecks - item.issues) / item.totalChecks) * 100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
      <div className="mt-4">
        <a
          href="#compliance"
          className="text-sm font-medium text-primary-600 hover:text-primary-800"
        >
          View detailed compliance report →
        </a>
      </div>
    </div>
  );
};

export default ComplianceOverview;