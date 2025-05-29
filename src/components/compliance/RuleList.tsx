import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Eye, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { ComplianceRule } from '../../types/ComplianceRule';

interface RuleListProps {
  searchQuery: string;
}

const complianceRules: ComplianceRule[] = [
  {
    id: 'rule1',
    name: 'Signature Verification',
    description: 'Checks for valid signatures on all pages requiring signature',
    category: 'Document Integrity',
    severity: 'high',
    status: 'active',
    createdBy: 'Jane Smith',
    createdDate: '2025-01-15',
    modifiedDate: '2025-02-28',
  },
  {
    id: 'rule2',
    name: 'GDPR Data Protection Clause',
    description: 'Verifies the presence of GDPR compliant data protection clauses',
    category: 'Privacy',
    severity: 'high',
    status: 'active',
    createdBy: 'Alex Johnson',
    createdDate: '2025-01-20',
    modifiedDate: '2025-03-05',
  },
  {
    id: 'rule3',
    name: 'Confidentiality Terms',
    description: 'Checks for standard confidentiality terms in NDAs',
    category: 'Confidentiality',
    severity: 'medium',
    status: 'active',
    createdBy: 'Robert Wilson',
    createdDate: '2025-02-10',
    modifiedDate: '2025-02-10',
  },
  {
    id: 'rule4',
    name: 'Payment Terms Validation',
    description: 'Validates that payment terms align with company policy',
    category: 'Financial',
    severity: 'medium',
    status: 'inactive',
    createdBy: 'Sarah Zhang',
    createdDate: '2025-02-18',
    modifiedDate: '2025-03-01',
  },
  {
    id: 'rule5',
    name: 'Intellectual Property Clause',
    description: 'Verifies IP protection clauses in agreements',
    category: 'Intellectual Property',
    severity: 'high',
    status: 'draft',
    createdBy: 'John Davis',
    createdDate: '2025-03-01',
    modifiedDate: '2025-03-10',
  },
];

const RuleList: React.FC<RuleListProps> = ({ searchQuery }) => {
  const [actionMenuRule, setActionMenuRule] = useState<string | null>(null);
  
  const filteredRules = complianceRules.filter((rule) =>
    rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleActionMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionMenuRule(actionMenuRule === id ? null : id);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Draft
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Rule Name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Category
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Severity
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Last Modified
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredRules.map((rule) => (
            <tr key={rule.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                <div className="text-xs text-gray-500 mt-1">{rule.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{rule.category}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getSeverityBadge(rule.severity)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(rule.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(rule.modifiedDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center space-x-2">
                  <button
                    className="text-primary-600 hover:text-primary-900"
                    title="View Rule"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className="text-primary-600 hover:text-primary-900"
                    title="Edit Rule"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <div className="relative">
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      title="More actions"
                      onClick={(e) => toggleActionMenu(rule.id, e)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {actionMenuRule === rule.id && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu">
                          <a
                            href="#!"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                            onClick={(e) => {
                              e.preventDefault();
                              setActionMenuRule(null);
                            }}
                          >
                            Duplicate Rule
                          </a>
                          <a
                            href="#!"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                            onClick={(e) => {
                              e.preventDefault();
                              setActionMenuRule(null);
                            }}
                          >
                            Export Rule
                          </a>
                          <a
                            href="#!"
                            className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            role="menuitem"
                            onClick={(e) => {
                              e.preventDefault();
                              setActionMenuRule(null);
                            }}
                          >
                            Delete Rule
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
          {filteredRules.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                No rules found matching your search criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RuleList;