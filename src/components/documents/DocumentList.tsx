import React, { useState } from 'react';
import { Eye, Download, MessageSquare, MoreHorizontal, AlertTriangle, FileText, Calendar, DollarSign, Users, Tag, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import { Document } from '../../types/Document';

interface DocumentListProps {
  searchQuery: string;
  selectedProject: string;
  selectedL1: string[];
  selectedL2: string[];
  selectedClients: string[];
  selectedSuppliers: string[];
}

const documentData: Document[] = [
  {
    id: 'doc1',
    title: 'Master Service Agreement - Acme Corp',
    type: 'Contract', 
    project: {
      id: 'DT-2025-001',
      name: 'Digital Transformation 2025'
    },
    category: {
      l1: 'Professional Services',
      l2: 'Consulting'
    },
    tags: ['commercial', 'service'],
    created: '2025-03-15',
    modified: '2025-03-18',
    status: 'approved',
    version: '1.2',
    size: '1.2 MB',
    parties: {
      supplier: {
        name: 'Acme Consulting Corp',
        id: 'sup_123'
      },
      client: {
        name: 'Our Company',
        id: 'cli_001'
      }
    },
    summary: 'Comprehensive consulting services agreement covering strategic advisory, implementation support, and knowledge transfer. Key terms include quarterly performance reviews, milestone-based payments, and strict confidentiality provisions. Contract value: $500,000 annually with optional renewal for 2 years.'
  },
  {
    id: 'doc2',
    title: 'Non-Disclosure Agreement - XYZ Inc.',
    type: 'NDA', 
    category: {
      l1: 'Legal Services',
      l2: 'Legal Services'
    },
    tags: ['confidentiality'],
    created: '2025-03-12',
    modified: '2025-03-14',
    status: 'pending',
    version: '1.0',
    size: '0.8 MB',
    parties: {
      supplier: {
        name: 'XYZ Technology Inc',
        id: 'sup_456'
      },
      client: {
        name: 'Our Company',
        id: 'cli_001'
      }
    },
    summary: 'Bilateral confidentiality agreement protecting trade secrets, intellectual property, and business processes. Includes standard 5-year term with automatic renewal, specific provisions for data protection, and clear breach remedies.'
  },
  {
    id: 'doc3',
    title: 'Software License Agreement - Tech Systems',
    type: 'Contract', 
    category: {
      l1: 'IT',
      l2: 'Software'
    },
    tags: ['licensing', 'software'],
    created: '2025-03-05',
    modified: '2025-03-07',
    status: 'approved',
    version: '1.3',
    size: '1.5 MB',
    parties: {
      supplier: {
        name: 'Tech Systems Solutions',
        id: 'sup_789'
      },
      client: {
        name: 'Our Company',
        id: 'cli_001'
      }
    },
    summary: 'Enterprise-wide software licensing agreement for cloud-based ERP system. Includes unlimited user access, 24/7 support SLA, quarterly updates, and data migration services. Total contract value: $2.5M over 3 years with annual payment structure.'
  }
];

const DocumentList: React.FC<DocumentListProps> = ({ 
  searchQuery, 
  selectedProject,
  selectedL1, 
  selectedL2,
  selectedClients,
  selectedSuppliers
}) => {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [actionMenuDoc, setActionMenuDoc] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'date' | 'title' | 'type'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredDocuments = documentData.filter((doc) => {
    // Apply search filter
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.tags?.length > 0 && doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) || false;

    // Apply project filter
    const matchesProject = !selectedProject || doc.projectId === selectedProject;

    // Apply category filters
    const matchesL1 = selectedL1.length === 0 || selectedL1.includes(doc.category.l1);
    const matchesL2 = selectedL2.length === 0 || selectedL2.includes(doc.category.l2);
    
    // Apply client filter
    const matchesClient = selectedClients.length === 0 || selectedClients.includes(doc.parties.client.id);
    
    // Apply supplier filter
    const matchesSupplier = selectedSuppliers.length === 0 || (
      doc.supplierId ? selectedSuppliers.includes(doc.supplierId) :
      selectedSuppliers.includes(doc.parties.supplier.id)
    );

    return matchesSearch && matchesProject && matchesL1 && matchesL2 && matchesClient && matchesSupplier;
  });

  const toggleExpand = (id: string) => {
    setExpandedDoc(expandedDoc === id ? null : id);
  };

  const toggleActionMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionMenuDoc(actionMenuDoc === id ? null : id);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => {
                if (sortField === 'title') {
                  setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortField('title');
                  setSortDirection('asc');
                }
              }}
            >
              <div className="flex items-center">
                Document
                {sortField === 'title' && (
                  sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => {
                if (sortField === 'type') {
                  setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortField('type');
                  setSortDirection('asc');
                }
              }}
            >
              <div className="flex items-center">
                Type
                {sortField === 'type' && (
                  sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => {
                if (sortField === 'date') {
                  setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortField('date');
                  setSortDirection('asc');
                }
              }}
            >
              <div className="flex items-center">
                Modified
                {sortField === 'date' && (
                  sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </div>
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
              Owner
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredDocuments.map((doc) => (
            <React.Fragment key={doc.id}>
            <tr
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => toggleExpand(doc.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {doc.category.l1} / {doc.category.l2}
                      {doc.project && (
                        <span className="ml-2 text-primary-600">
                          Project: {doc.project.name} ({doc.project.id})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{doc.type}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {new Date(doc.modified).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    doc.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : doc.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{doc.parties.client.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex space-x-2">
                  <a 
                    href={`#contracts/view/${doc.id}`}
                    className="text-primary-600 hover:text-primary-900" 
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <button className="text-primary-600 hover:text-primary-900" title="Download">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="text-primary-600 hover:text-primary-900">
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
            {expandedDoc === doc.id && (
              <tr>
                <td colSpan={6} className="px-6 py-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Document Details</h4>
                      <div className="space-y-2">
                        {doc.project && (
                          <div className="flex items-center text-sm">
                            <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">Project: {doc.project.name} ({doc.project.id})</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Created: {new Date(doc.created).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Supplier: {doc.parties.supplier.name}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Tag className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="flex flex-wrap gap-1">
                            {doc.tags.map((tag, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Summary</h4>
                      <p className="text-sm text-gray-600">{doc.summary}</p>
                      <div className="mt-4 flex space-x-3">
                        <a 
                          href={`#contracts/view/${doc.id}`}
                          className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </a>
                        <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </button>
                        <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Add Comment
                        </button>
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

export default DocumentList;