import React, { useState } from 'react';
import { ArrowLeft, Download, Share2, Archive, Clock, Calendar, DollarSign, Users, Building2, Tag, Shield, CheckCircle } from 'lucide-react';
import ContractDetails from './ContractDetails';
import ContractVersionControl from './ContractVersionControl';
import ContractWorkflow from './ContractWorkflow';

interface ContractDetailsViewProps {
  contractId?: string;
}

const ContractDetailsView: React.FC<ContractDetailsViewProps> = ({ contractId }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'versions' | 'workflow'>('details');

  // Mock contract data - replace with actual API call
  const contract = {
    id: contractId || 'contract1',
    title: 'Master Service Agreement - Acme Corp',
    type: 'Service Agreement',
    status: 'active',
    parties: {
      company: [
        { id: 'comp1', name: 'Acme Corp', role: 'supplier' },
        { id: 'comp2', name: 'Our Company', role: 'client' }
      ]
    },
    value: {
      amount: 500000,
      currency: 'USD',
      period: 'annually'
    },
    dates: {
      effectiveDate: '2025-01-01',
      expirationDate: '2027-12-31',
      nextReviewDate: '2025-06-01'
    },
    terms: {
      paymentTerms: 'Net 30',
      renewalTerms: 'Automatic 1-year renewal',
      terminationTerms: '90 days notice'
    },
    compliance: {
      requirements: [
        'Annual security audit',
        'Quarterly performance review',
        'Monthly reporting'
      ],
      status: 'compliant',
      lastReviewDate: '2025-01-15',
      nextReviewDate: '2025-04-15'
    },
    metadata: {
      category: 'IT Services',
      subcategory: 'Infrastructure',
      tags: ['critical', 'high-value', 'strategic'],
      department: 'IT',
      owner: 'John Smith'
    },
    versions: [] // Added empty versions array to prevent mapping error
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.location.hash = '#contracts'}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
            <p className="text-gray-600">Contract ID: {contract.id}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'details'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('versions')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'versions'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Versions
                </button>
                <button
                  onClick={() => setActiveTab('workflow')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'workflow'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Workflow
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'details' && <ContractDetails contract={contract} />}
              {activeTab === 'versions' && <ContractVersionControl contract={contract} />}
              {activeTab === 'workflow' && <ContractWorkflow contract={contract} />}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contract Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">Effective Date</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(contract.dates.effectiveDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">Value</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  ${contract.value.amount.toLocaleString()} {contract.value.period}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">Department</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {contract.metadata.department}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">Owner</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {contract.metadata.owner}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Status</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    contract.compliance.status === 'compliant'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {contract.compliance.status.toUpperCase()}
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-500">Requirements:</span>
                  <ul className="mt-2 space-y-2">
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
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
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
    </div>
  );
};

export default ContractDetailsView;