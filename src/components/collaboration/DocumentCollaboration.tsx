import React, { useState } from 'react';
import { FileText, Users, MessageSquare, Calendar, Clock, Filter, Search, Plus, Eye, Download, Share2, History, Edit, Upload, ExternalLink } from 'lucide-react';
import DocumentViewer from './DocumentViewer';
import '../../styles/document-viewer.css';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'in_review' | 'approved' | 'rejected';
  lastModified: string;
  modifiedBy: string;
  collaborators: number;
  commentCount: number;
  internalComments: number;
  externalComments: number;
  version: string;
}

const DocumentCollaboration: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'status'>('modified');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sample documents data
  const documents: Document[] = [
    {
      id: 'doc1',
      name: 'Master Service Agreement - Acme Corp',
      type: 'Agreement',
      status: 'in_review',
      lastModified: '2025-03-20T14:30:00',
      modifiedBy: 'Jane Smith',
      collaborators: 5,
      commentCount: 8,
      internalComments: 5,
      externalComments: 3,
      version: '1.2'
    },
    {
      id: 'doc2',
      name: 'Non-Disclosure Agreement - XYZ Inc.',
      type: 'NDA',
      status: 'approved',
      lastModified: '2025-03-18T10:15:00',
      modifiedBy: 'Robert Wilson',
      collaborators: 3,
      commentCount: 3,
      internalComments: 2,
      externalComments: 1,
      version: '2.0'
    },
    {
      id: 'doc3',
      name: 'Software License Agreement - Tech Systems',
      type: 'License',
      status: 'draft',
      lastModified: '2025-03-15T09:45:00',
      modifiedBy: 'Sarah Zhang',
      collaborators: 4,
      commentCount: 12,
      internalComments: 8,
      externalComments: 4,
      version: '0.9'
    },
    {
      id: 'doc4',
      name: 'Statement of Work - Digital Transformation',
      type: 'SOW',
      status: 'in_review',
      lastModified: '2025-03-10T16:20:00',
      modifiedBy: 'Mike Johnson',
      collaborators: 2,
      commentCount: 5,
      internalComments: 3,
      externalComments: 2,
      version: '1.1'
    }
  ];

  // Filter documents based on search query and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(doc.status);
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(doc.type);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'modified') {
      comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
    } else if (sortBy === 'status') {
      comparison = a.status.localeCompare(b.status);
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleViewDocument = (docId: string) => {
    setSelectedDocument(docId);
    setShowDocumentViewer(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Draft</span>;
      case 'in_review':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">In Review</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Collaboration</h1>
          <p className="text-gray-600">Review and collaborate on documents with internal teams and external parties</p>
        </div>
        <div className="mt-4 sm:mt-0 space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
          <button className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search documents..."
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <button
                className="w-full md:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {(selectedStatuses.length > 0 || selectedTypes.length > 0) && (
                  <span className="ml-1 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {selectedStatuses.length + selectedTypes.length}
                  </span>
                )}
              </button>

              {filterOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1 p-3" role="menu">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Status</h3>
                    <div className="space-y-2">
                      {['draft', 'in_review', 'approved', 'rejected'].map((status) => (
                        <label key={status} className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={selectedStatuses.includes(status)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStatuses([...selectedStatuses, status]);
                              } else {
                                setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                              }
                            }}
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">{status.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>

                    <h3 className="text-sm font-medium text-gray-900 mt-4 mb-2">Document Type</h3>
                    <div className="space-y-2">
                      {['Agreement', 'NDA', 'License', 'SOW'].map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={selectedTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTypes([...selectedTypes, type]);
                              } else {
                                setSelectedTypes(selectedTypes.filter(t => t !== type));
                              }
                            }}
                          />
                          <span className="ml-2 text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-between">
                      <button
                        className="text-sm text-gray-600 hover:text-gray-900"
                        onClick={() => {
                          setSelectedStatuses([]);
                          setSelectedTypes([]);
                        }}
                      >
                        Clear All
                      </button>
                      <button
                        className="text-sm text-primary-600 hover:text-primary-800"
                        onClick={() => setFilterOpen(false)}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary-600" />
            Documents
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    if (sortBy === 'name') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('name');
                      setSortDirection('asc');
                    }
                  }}
                >
                  Document Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    if (sortBy === 'status') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('status');
                      setSortDirection('asc');
                    }
                  }}
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    if (sortBy === 'modified') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('modified');
                      setSortDirection('desc');
                    }
                  }}
                >
                  Last Modified
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Comments
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Version
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
              {sortedDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{doc.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(doc.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(doc.lastModified)}</div>
                    <div className="text-xs text-gray-500">by {doc.modifiedBy}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <MessageSquare className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="mr-2">{doc.commentCount}</span>
                      <div className="flex items-center space-x-1">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {doc.internalComments}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {doc.externalComments}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <History className="h-4 w-4 mr-1 text-gray-400" />
                      v{doc.version}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="text-primary-600 hover:text-primary-900 relative group"
                        onClick={() => handleViewDocument(doc.id)}
                        title="View Document"
                      >
                        <Eye className="h-5 w-5" />
                        <span className="absolute -top-10 right-0 w-32 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          View & Comment
                        </span>
                      </button>
                      <button
                        className="text-primary-600 hover:text-primary-900 relative group"
                        title="Edit Document"
                      >
                        <Edit className="h-5 w-5" />
                        <span className="absolute -top-10 right-0 w-24 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          Edit Document
                        </span>
                      </button>
                      <button
                        className="text-primary-600 hover:text-primary-900 relative group"
                        title="Download Document"
                      >
                        <Download className="h-5 w-5" />
                        <span className="absolute -top-10 right-0 w-24 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          Download
                        </span>
                      </button>
                      <button
                        className="text-primary-600 hover:text-primary-900 relative group"
                        title="Share Document"
                      >
                        <ExternalLink className="h-5 w-5" />
                        <span className="absolute -top-10 right-0 w-16 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          Share
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocuments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No documents found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <DocumentViewer 
          documentId={selectedDocument}
          documentName={documents.find(doc => doc.id === selectedDocument)?.name}
          onClose={() => setShowDocumentViewer(false)}
        />
      )}
    </div>
  );
};

export default DocumentCollaboration;