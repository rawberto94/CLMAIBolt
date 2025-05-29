import React, { useState } from 'react';
import { FileText, User, Calendar, Filter, Download, Search, ChevronDown, ChevronUp, Eye, Settings, Shield, XCircle } from 'lucide-react';

interface AuditEvent {
  id: string;
  action: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: string;
  documentId?: string;
  documentName?: string;
  details: string;
  category: 'document' | 'rule' | 'system' | 'user';
  ip?: string;
  metadata?: Record<string, any>;
}

const AuditTrail: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  // Sample audit events
  const auditEvents: AuditEvent[] = [
    {
      id: 'event1',
      action: 'Document Created',
      user: {
        id: 'user1',
        name: 'Jane Smith',
        role: 'Legal Admin'
      },
      timestamp: '2025-03-20T14:30:00',
      documentId: 'doc123',
      documentName: 'Master Service Agreement - Acme Corp',
      details: 'Created new contract document',
      category: 'document',
      ip: '192.168.1.100',
      metadata: {
        documentType: 'Contract',
        version: '1.0'
      }
    },
    {
      id: 'event2',
      action: 'Compliance Rule Modified',
      user: {
        id: 'user2',
        name: 'Robert Wilson',
        role: 'Compliance Officer'
      },
      timestamp: '2025-03-20T13:15:00',
      details: 'Updated GDPR compliance rule conditions',
      category: 'rule',
      ip: '192.168.1.101',
      metadata: {
        ruleId: 'rule456',
        ruleName: 'GDPR Compliance Check'
      }
    },
    {
      id: 'event3',
      action: 'Document Approved',
      user: {
        id: 'user3',
        name: 'Sarah Zhang',
        role: 'Legal Counsel'
      },
      timestamp: '2025-03-20T11:45:00',
      documentId: 'doc456',
      documentName: 'Non-Disclosure Agreement - XYZ Inc.',
      details: 'Approved document in legal review workflow',
      category: 'document',
      ip: '192.168.1.102',
      metadata: {
        workflowStage: 'Legal Review',
        comments: 'All legal requirements met'
      }
    },
    {
      id: 'event4',
      action: 'User Permission Changed',
      user: {
        id: 'user4',
        name: 'Mike Johnson',
        role: 'System Administrator'
      },
      timestamp: '2025-03-20T10:30:00',
      details: 'Updated permissions for user Alex Nguyen',
      category: 'user',
      ip: '192.168.1.103',
      metadata: {
        targetUser: 'Alex Nguyen',
        permissionChanges: ['Added: Document Approval', 'Removed: System Administration']
      }
    },
    {
      id: 'event5',
      action: 'Compliance Scan Completed',
      user: {
        id: 'system',
        name: 'System',
        role: 'Automated Process'
      },
      timestamp: '2025-03-20T09:00:00',
      details: 'Completed daily compliance scan of all active contracts',
      category: 'system',
      metadata: {
        scanDuration: '45 minutes',
        documentsScanned: 127,
        issuesFound: 3
      }
    },
    {
      id: 'event6',
      action: 'Document Exported',
      user: {
        id: 'user5',
        name: 'Emily Davis',
        role: 'Document Manager'
      },
      timestamp: '2025-03-20T08:15:00',
      documentId: 'doc789',
      documentName: 'Software License Agreement - Tech Systems',
      details: 'Exported document as PDF',
      category: 'document',
      ip: '192.168.1.104',
      metadata: {
        exportFormat: 'PDF',
        exportReason: 'Client Request'
      }
    },
    {
      id: 'event7',
      action: 'Alert Resolved',
      user: {
        id: 'user2',
        name: 'Robert Wilson',
        role: 'Compliance Officer'
      },
      timestamp: '2025-03-19T16:45:00',
      details: 'Resolved compliance alert for missing GDPR clause',
      category: 'rule',
      ip: '192.168.1.101',
      metadata: {
        alertId: 'alert123',
        resolution: 'Added required GDPR clause to document'
      }
    }
  ];

  // Filter audit events based on search query, categories, and date range
  const filteredEvents = auditEvents.filter(event => {
    const matchesSearch = 
      event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.documentName && event.documentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      event.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.category);
    
    const eventDate = new Date(event.timestamp);
    const matchesStartDate = !dateRange.start || eventDate >= new Date(dateRange.start);
    const matchesEndDate = !dateRange.end || eventDate <= new Date(dateRange.end);
    
    return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'document':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FileText className="h-3 w-3 mr-1" />
            Document
          </span>
        );
      case 'rule':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Shield className="h-3 w-3 mr-1" />
            Rule
          </span>
        );
      case 'system':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Settings className="h-3 w-3 mr-1" />
            System
          </span>
        );
      case 'user':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <User className="h-3 w-3 mr-1" />
            User
          </span>
        );
      default:
        return null;
    }
  };

  const handleExport = () => {
    // Handle export functionality
    console.log('Exporting audit trail...');
  };

  const handleViewDetails = (eventId: string) => {
    setSelectedEvent(eventId);
    setShowEventDetails(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary-600" />
            Compliance Audit Trail
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Complete history of all contract-related actions and compliance activities
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Audit Log
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
              placeholder="Search audit events..."
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
                {(selectedCategories.length > 0 || dateRange.start || dateRange.end) && (
                  <span className="ml-1 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {selectedCategories.length + (dateRange.start ? 1 : 0) + (dateRange.end ? 1 : 0)}
                  </span>
                )}
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Event Type</h3>
                    <div className="space-y-2">
                      {['document', 'rule', 'system', 'user'].map((category) => (
                        <label key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={selectedCategories.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, category]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(c => c !== category));
                              }
                            }}
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">{category}</span>
                        </label>
                      ))}
                    </div>

                    <h3 className="text-sm font-medium text-gray-900 mt-4 mb-2">Date Range</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                        <input
                          type="date"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
                        <input
                          type="date"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between">
                      <button
                        className="text-sm text-gray-600 hover:text-gray-900"
                        onClick={() => {
                          setSelectedCategories([]);
                          setDateRange({ start: '', end: '' });
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <React.Fragment key={event.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTimestamp(event.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{event.action}</div>
                    {event.documentName && (
                      <div className="text-xs text-gray-500">{event.documentName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{event.user.name}</div>
                    </div>
                    <div className="text-xs text-gray-500">{event.user.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCategoryBadge(event.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(event.id)}
                        className="text-primary-600 hover:text-primary-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Expand"
                      >
                        {expandedEvent === event.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedEvent === event.id && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-4">
                        {event.metadata && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Information</h4>
                            <div className="bg-white p-3 rounded-md border border-gray-200">
                              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                {Object.entries(event.metadata).map(([key, value]) => (
                                  <div key={key} className="sm:col-span-1">
                                    <dt className="text-xs font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                      {Array.isArray(value) ? value.join(', ') : value.toString()}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            </div>
                          </div>
                        )}
                        {event.ip && (
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="font-medium mr-2">IP Address:</span>
                            {event.ip}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filteredEvents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No audit events found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Audit Event Details</h3>
              <button
                onClick={() => {
                  setShowEventDetails(false);
                  setSelectedEvent(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {auditEvents.filter(e => e.id === selectedEvent).map(event => (
                <div key={event.id} className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-medium text-gray-900">{event.action}</h2>
                      {getCategoryBadge(event.category)}
                    </div>
                    <p className="mt-2 text-gray-600">{event.details}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Event Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Timestamp</span>
                          <span className="text-sm font-medium text-gray-900">{formatTimestamp(event.timestamp)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">User</span>
                          <span className="text-sm font-medium text-gray-900">{event.user.name} ({event.user.role})</span>
                        </div>
                        {event.ip && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">IP Address</span>
                            <span className="text-sm font-medium text-gray-900">{event.ip}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {event.documentName && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Related Document</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{event.documentName}</span>
                          </div>
                          <button className="mt-3 text-sm text-primary-600 hover:text-primary-800">
                            View Document
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {event.metadata && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Additional Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <div key={key} className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {Array.isArray(value) ? value.join(', ') : value.toString()}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEventDetails(false);
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrail;