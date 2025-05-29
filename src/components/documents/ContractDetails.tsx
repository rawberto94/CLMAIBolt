import React, { useState } from 'react';
import { FileText, Calendar, DollarSign, Users, Tag, AlertTriangle, CheckCircle, X } from 'lucide-react';
import type { Contract } from '../../types/Contract';

interface ContractDetailsProps {
  contract: Contract;
  onEdit?: (contractId: string) => void;
  onShare?: (contractId: string) => void;
  onArchive?: (contractId: string) => void;
}

const ContractDetails: React.FC<ContractDetailsProps> = ({
  contract,
  onEdit,
  onShare,
  onArchive
}) => {
  const [activeSection, setActiveSection] = useState<string>('general');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contract Type</h3>
            <p className="mt-1 text-sm text-gray-900">{contract.type}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Parties</h3>
            <div className="mt-2 space-y-2">
              {contract.parties.company.map((party) => (
                <div key={party.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{party.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{party.role}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    party.role === 'client' 
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-secondary-100 text-secondary-800'
                  }`}>
                    {party.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Contract Value</h3>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: contract.value.currency
                  }).format(contract.value.amount)}
                </span>
              </div>
              {contract.value.period && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Period</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {contract.value.period}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Key Dates</h3>
            <div className="mt-2 space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Effective Date</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(contract.dates.effectiveDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Expiration Date</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(contract.dates.expirationDate).toLocaleDateString()}
                </span>
              </div>
              {contract.dates.nextReviewDate && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Next Review</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(contract.dates.nextReviewDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Terms</h3>
            <div className="mt-2 space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Payment Terms</p>
                <p className="mt-1 text-sm text-gray-600">{contract.terms.paymentTerms}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Renewal Terms</p>
                <p className="mt-1 text-sm text-gray-600">{contract.terms.renewalTerms}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Termination Terms</p>
                <p className="mt-1 text-sm text-gray-600">{contract.terms.terminationTerms}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Compliance Requirements</h3>
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  contract.compliance.status === 'compliant'
                    ? 'bg-green-100 text-green-800'
                    : contract.compliance.status === 'review_needed'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {contract.compliance.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  Last reviewed: {new Date(contract.compliance.lastReviewDate).toLocaleDateString()}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                Next review: {new Date(contract.compliance.nextReviewDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="p-4">
            <ul className="space-y-2">
              {contract.compliance.requirements.map((req, index) => (
                <li key={index} className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Metadata</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Category</span>
              <span className="text-sm font-medium text-gray-900">{contract.metadata.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Subcategory</span>
              <span className="text-sm font-medium text-gray-900">{contract.metadata.subcategory}</span>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Department</span>
              <span className="text-sm font-medium text-gray-900">{contract.metadata.department}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Owner</span>
              <span className="text-sm font-medium text-gray-900">{contract.metadata.owner}</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <Tag className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {contract.metadata.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetails;