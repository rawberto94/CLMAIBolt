import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, XCircle, Clock, FileText, Calendar, Filter, ChevronDown, ChevronUp, Eye, X } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'acknowledged' | 'resolved';
  timestamp: string;
  documentId?: string;
  documentName?: string;
  ruleId?: string;
  ruleName?: string;
  assignedTo?: string;
}

interface RealTimeAlertsProps {
  onDismiss: (alertId: string) => void;
  onResolve: (alertId: string) => void;
}

const RealTimeAlerts: React.FC<RealTimeAlertsProps> = ({ onDismiss, onResolve }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  // Sample alerts data
  const alerts: Alert[] = [
    {
      id: 'alert1',
      title: 'Missing GDPR Compliance Clause',
      description: 'The contract with EU-based client XYZ Corp is missing required GDPR data protection clauses.',
      severity: 'critical',
      status: 'new',
      timestamp: '2025-03-20T09:30:00',
      documentId: 'doc123',
      documentName: 'Service Agreement - XYZ Corp',
      ruleId: 'rule456',
      ruleName: 'GDPR Compliance Check'
    },
    {
      id: 'alert2',
      title: 'Contract Expiration Warning',
      description: 'The software license agreement with Tech Systems will expire in 30 days.',
      severity: 'medium',
      status: 'acknowledged',
      timestamp: '2025-03-19T14:15:00',
      documentId: 'doc456',
      documentName: 'Software License Agreement - Tech Systems',
      ruleId: 'rule789',
      ruleName: 'Contract Expiration Monitor',
      assignedTo: 'Sarah Zhang'
    },
    {
      id: 'alert3',
      title: 'Non-Standard Payment Terms',
      description: 'The contract with Acme Corp contains payment terms (Net 60) that deviate from company policy (Net 30).',
      severity: 'high',
      status: 'new',
      timestamp: '2025-03-20T08:45:00',
      documentId: 'doc789',
      documentName: 'Master Service Agreement - Acme Corp',
      ruleId: 'rule123',
      ruleName: 'Payment Terms Validator'
    },
    {
      id: 'alert4',
      title: 'Regulatory Change Affecting Contracts',
      description: 'Recent changes to financial regulations affect 5 existing contracts with financial service providers.',
      severity: 'high',
      status: 'new',
      timestamp: '2025-03-18T16:20:00',
      ruleId: 'rule321',
      ruleName: 'Regulatory Change Monitor'
    },
    {
      id: 'alert5',
      title: 'Vendor Compliance Certificate Expired',
      description: 'The security compliance certificate for vendor Global Services Inc. has expired.',
      severity: 'medium',
      status: 'new',
      timestamp: '2025-03-17T11:10:00',
      ruleId: 'rule654',
      ruleName: 'Vendor Certification Monitor'
    }
  ];

  // Filter alerts based on selected filters
  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = selectedSeverity.length === 0 || selectedSeverity.includes(alert.severity);
    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(alert.status);
    return matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Low
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            New
          </span>
        );
      case 'acknowledged':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Acknowledged
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleViewDetails = (alertId: string) => {
    setSelectedAlert(alertId);
    setShowAlertDetails(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-primary-600" />
            Real-Time Compliance Alerts
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Immediate notifications for compliance issues and regulatory gaps
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {(selectedSeverity.length > 0 || selectedStatus.length > 0) && (
                <span className="ml-1 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {selectedSeverity.length + selectedStatus.length}
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Severity</h3>
                  <div className="space-y-2">
                    {['critical', 'high', 'medium', 'low'].map((severity) => (
                      <label key={severity} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={selectedSeverity.includes(severity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSeverity([...selectedSeverity, severity]);
                            } else {
                              setSelectedSeverity(selectedSeverity.filter(s => s !== severity));
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{severity}</span>
                      </label>
                    ))}
                  </div>

                  <h3 className="text-sm font-medium text-gray-900 mt-4 mb-2">Status</h3>
                  <div className="space-y-2">
                    {['new', 'acknowledged', 'resolved'].map((status) => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={selectedStatus.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStatus([...selectedStatus, status]);
                            } else {
                              setSelectedStatus(selectedStatus.filter(s => s !== status));
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      className="text-sm text-gray-600 hover:text-gray-900"
                      onClick={() => {
                        setSelectedSeverity([]);
                        setSelectedStatus([]);
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

      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-500">
              There are no alerts matching your current filter criteria.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div 
                className={`p-4 border-l-4 ${
                  alert.severity === 'critical' ? 'border-red-500' :
                  alert.severity === 'high' ? 'border-orange-500' :
                  alert.severity === 'medium' ? 'border-yellow-500' :
                  'border-green-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">{alert.title}</h3>
                      <div className="ml-3">
                        {getSeverityBadge(alert.severity)}
                      </div>
                      <div className="ml-2">
                        {getStatusBadge(alert.status)}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{alert.description}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTimestamp(alert.timestamp)}
                      {alert.documentName && (
                        <>
                          <span className="mx-2">•</span>
                          <FileText className="h-4 w-4 mr-1" />
                          {alert.documentName}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(alert.id)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onResolve(alert.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                      className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                    >
                      {expandedAlert === alert.id ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Show Details
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {expandedAlert === alert.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Triggered By</h4>
                        <p className="mt-1 text-sm text-gray-500">{alert.ruleName || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Assigned To</h4>
                        <p className="mt-1 text-sm text-gray-500">{alert.assignedTo || 'Unassigned'}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">Recommended Action</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {alert.severity === 'critical' 
                          ? 'Immediate review and remediation required.' 
                          : alert.severity === 'high'
                          ? 'Review and address within 24 hours.'
                          : 'Review and address within 3 business days.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showAlertDetails && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Alert Details</h3>
              <button
                onClick={() => {
                  setShowAlertDetails(false);
                  setSelectedAlert(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {alerts.filter(a => a.id === selectedAlert).map(alert => (
                <div key={alert.id} className="space-y-6">
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-xl font-medium text-gray-900">{alert.title}</h2>
                      <div className="ml-3">
                        {getSeverityBadge(alert.severity)}
                      </div>
                    </div>
                    <p className="mt-2 text-gray-600">{alert.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Alert Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Status</span>
                          <span className="text-sm font-medium text-gray-900 capitalize">{alert.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Detected</span>
                          <span className="text-sm font-medium text-gray-900">{formatTimestamp(alert.timestamp)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Rule</span>
                          <span className="text-sm font-medium text-gray-900">{alert.ruleName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Assigned To</span>
                          <span className="text-sm font-medium text-gray-900">{alert.assignedTo || 'Unassigned'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Affected Document</h3>
                      {alert.documentName ? (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{alert.documentName}</span>
                          </div>
                          <button className="text-sm text-primary-600 hover:text-primary-800">
                            View Document
                          </button>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
                          No specific document associated with this alert.
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Recommended Actions</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ul className="space-y-2 text-sm text-gray-600">
                        {alert.severity === 'critical' && (
                          <>
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-red-500">
                                <AlertTriangle className="h-5 w-5" />
                              </div>
                              <span className="ml-2">Immediate review required - escalate to legal team</span>
                            </li>
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-red-500">
                                <AlertTriangle className="h-5 w-5" />
                              </div>
                              <span className="ml-2">Update document with required compliance clauses</span>
                            </li>
                          </>
                        )}
                        {alert.severity === 'high' && (
                          <>
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-orange-500">
                                <AlertTriangle className="h-5 w-5" />
                              </div>
                              <span className="ml-2">Review and address within 24 hours</span>
                            </li>
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-orange-500">
                                <AlertTriangle className="h-5 w-5" />
                              </div>
                              <span className="ml-2">Consult with compliance team for guidance</span>
                            </li>
                          </>
                        )}
                        {alert.severity === 'medium' && (
                          <>
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-yellow-500">
                                <AlertTriangle className="h-5 w-5" />
                              </div>
                              <span className="ml-2">Review and address within 3 business days</span>
                            </li>
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-yellow-500">
                                <AlertTriangle className="h-5 w-5" />
                              </div>
                              <span className="ml-2">Document resolution steps in compliance log</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAlertDetails(false);
                  setSelectedAlert(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onResolve(selectedAlert);
                  setShowAlertDetails(false);
                  setSelectedAlert(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeAlerts;