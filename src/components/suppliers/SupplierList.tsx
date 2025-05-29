import React, { useState } from 'react';
import { Shield, ExternalLink, FileText, BarChart2, Mail, Phone, MapPin, Building2 } from 'lucide-react';

interface SupplierListProps {
  searchQuery: string;
}

interface Supplier {
  id: number;
  name: string;
  category: string;
  riskLevel: string;
  complianceScore: number;
  lastEvaluation: string;
  details: {
    address: string;
    phone: string;
    email: string;
    website: string;
    primaryContact: string;
    industry: string;
    yearEstablished: number;
    employeeCount: string;
    certifications: string[];
  };
  contracts: {
    active: number;
    total: number;
    value: string;
  };
  performance: {
    onTimeDelivery: number;
    qualityScore: number;
    responseTime: string;
  };
}

const SupplierList: React.FC<SupplierListProps> = ({ searchQuery }) => {
  // Mock data for demonstration
  const suppliers: Supplier[] = [
    {
      id: 1,
      name: 'Acme Corporation',
      category: 'Strategic',
      riskLevel: 'Low',
      complianceScore: 95,
      lastEvaluation: '2025-03-01',
      details: {
        address: '123 Tech Park, Silicon Valley, CA',
        phone: '+1 (555) 123-4567',
        email: 'contact@acmecorp.com',
        website: 'www.acmecorp.com',
        primaryContact: 'John Smith',
        industry: 'Technology',
        yearEstablished: 1995,
        employeeCount: '1000-5000',
        certifications: ['ISO 9001', 'ISO 27001', 'SOC 2'],
      },
      contracts: {
        active: 3,
        total: 5,
        value: '$2.5M',
      },
      performance: {
        onTimeDelivery: 98,
        qualityScore: 95,
        responseTime: '< 24 hours',
      },
    },
    {
      id: 2,
      name: 'Global Supplies Inc.',
      category: 'Preferred',
      riskLevel: 'Medium',
      complianceScore: 82,
      lastEvaluation: '2025-02-15',
      details: {
        address: '456 Industrial Ave, Chicago, IL',
        phone: '+1 (555) 987-6543',
        email: 'info@globalsupplies.com',
        website: 'www.globalsupplies.com',
        primaryContact: 'Sarah Johnson',
        industry: 'Manufacturing',
        yearEstablished: 2000,
        employeeCount: '500-1000',
        certifications: ['ISO 9001', 'ISO 14001'],
      },
      contracts: {
        active: 2,
        total: 4,
        value: '$1.8M',
      },
      performance: {
        onTimeDelivery: 85,
        qualityScore: 88,
        responseTime: '48 hours',
      },
    },
    {
      id: 3,
      name: 'Tech Solutions Ltd',
      category: 'Approved',
      riskLevel: 'High',
      complianceScore: 68,
      lastEvaluation: '2025-01-30',
      details: {
        address: '789 Innovation Blvd, Boston, MA',
        phone: '+1 (555) 456-7890',
        email: 'support@techsolutions.com',
        website: 'www.techsolutions.com',
        primaryContact: 'Michael Chen',
        industry: 'Software',
        yearEstablished: 2010,
        employeeCount: '100-500',
        certifications: ['ISO 27001'],
      },
      contracts: {
        active: 1,
        total: 2,
        value: '$750K',
      },
      performance: {
        onTimeDelivery: 75,
        qualityScore: 70,
        responseTime: '72 hours',
      },
    },
  ];

  const [expandedSupplier, setExpandedSupplier] = useState<number | null>(null);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'strategic':
        return 'bg-purple-100 text-purple-800';
      case 'preferred':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Supplier
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Risk Level
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Compliance Score
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Evaluation
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredSuppliers.map((supplier) => (
            <React.Fragment key={supplier.id}>
            <tr 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => setExpandedSupplier(expandedSupplier === supplier.id ? null : supplier.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                    <div className="text-xs text-gray-500">{supplier.details.industry}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeColor(supplier.category)}`}>
                  {supplier.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskBadgeColor(supplier.riskLevel)}`}>
                  {supplier.riskLevel}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          supplier.complianceScore >= 90 ? 'bg-green-500' :
                          supplier.complianceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${supplier.complianceScore}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">{supplier.complianceScore}%</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {supplier.lastEvaluation}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button className="text-primary-600 hover:text-primary-900" title="View Contracts">
                    <FileText className="h-4 w-4" />
                  </button>
                  <button className="text-primary-600 hover:text-primary-900" title="View Performance">
                    <BarChart2 className="h-4 w-4" />
                  </button>
                  <button className="text-primary-600 hover:text-primary-900" title="Contact">
                    <Mail className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
            {expandedSupplier === supplier.id && (
              <tr className="bg-gray-50">
                <td colSpan={6} className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Company Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{supplier.details.address}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{supplier.details.phone}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{supplier.details.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <ExternalLink className="h-4 w-4 text-gray-400 mr-2" />
                          <a href={`https://${supplier.details.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-900">
                            {supplier.details.website}
                          </a>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Certifications</h5>
                        <div className="flex flex-wrap gap-2">
                          {supplier.details.certifications.map((cert, index) => (
                            <span key={index} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Contract Overview</h4>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Active Contracts</div>
                            <div className="text-lg font-semibold text-gray-900">{supplier.contracts.active}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Total Value</div>
                            <div className="text-lg font-semibold text-gray-900">{supplier.contracts.value}</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <button className="w-full text-center text-sm font-medium text-primary-600 hover:text-primary-800">
                            View All Contracts
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Performance Metrics</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">On-Time Delivery</span>
                            <span className="font-medium text-gray-900">{supplier.performance.onTimeDelivery}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${supplier.performance.onTimeDelivery}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Quality Score</span>
                            <span className="font-medium text-gray-900">{supplier.performance.qualityScore}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${supplier.performance.qualityScore}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Average Response Time: </span>
                          <span className="font-medium text-gray-900">{supplier.performance.responseTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierList;