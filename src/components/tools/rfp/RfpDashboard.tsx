import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight, 
  BarChart2, 
  ArrowRight, 
  Mail, 
  MessageSquare, 
  Eye, 
  Edit, 
  Trash2,
  X,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

interface RfpDashboardProps {
  selectedRfp: string | null;
  onSelectRfp: (rfpId: string) => void;
}

interface Rfp {
  id: string;
  title: string;
  category: string;
  status: 'draft' | 'published' | 'closed' | 'awarded';
  dueDate: string;
  publishDate: string;
  submissions: number;
  department: string;
  budget: string;
  description: string;
  progress: number;
}

const RfpDashboard: React.FC<RfpDashboardProps> = ({ selectedRfp, onSelectRfp }) => {
  const [showRfpDetails, setShowRfpDetails] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [notificationRecipients, setNotificationRecipients] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  // Sample RFP data
  const rfps: Rfp[] = [
    {
      id: 'rfp-2025-001',
      title: 'Enterprise Resource Planning (ERP) System Implementation',
      category: 'Software',
      status: 'published',
      dueDate: '2025-04-15',
      publishDate: '2025-03-15',
      submissions: 4,
      department: 'IT',
      budget: '$500,000 - $750,000',
      description: 'Seeking proposals for the implementation of a new ERP system to replace our legacy systems and integrate finance, HR, and operations.',
      progress: 65
    },
    {
      id: 'rfp-2025-002',
      title: 'IT Infrastructure Managed Services',
      category: 'IT Services',
      status: 'draft',
      dueDate: '2025-05-01',
      publishDate: '',
      submissions: 0,
      department: 'IT',
      budget: '$200,000 - $300,000 annually',
      description: 'Looking for managed service providers to handle our IT infrastructure, including network, servers, and cloud services.',
      progress: 30
    },
    {
      id: 'rfp-2025-003',
      title: 'Digital Marketing Agency Selection',
      category: 'Professional Services',
      status: 'closed',
      dueDate: '2025-02-28',
      publishDate: '2025-01-15',
      submissions: 12,
      department: 'Marketing',
      budget: '$150,000 - $200,000 annually',
      description: 'Seeking a digital marketing agency to handle our online presence, SEO, content marketing, and social media campaigns.',
      progress: 100
    },
    {
      id: 'rfp-2025-004',
      title: 'Cybersecurity Assessment and Remediation',
      category: 'IT Services',
      status: 'awarded',
      dueDate: '2025-01-31',
      publishDate: '2024-12-15',
      submissions: 8,
      department: 'IT Security',
      budget: '$100,000 - $150,000',
      description: 'Comprehensive cybersecurity assessment and remediation services to identify and address vulnerabilities in our systems.',
      progress: 100
    }
  ];

  // Find the selected RFP
  const selectedRfpData = rfps.find(rfp => rfp.id === selectedRfp);

  // Stats for the dashboard
  const stats = {
    totalRfps: rfps.length,
    activeRfps: rfps.filter(rfp => rfp.status === 'published').length,
    draftRfps: rfps.filter(rfp => rfp.status === 'draft').length,
    closedRfps: rfps.filter(rfp => rfp.status === 'closed' || rfp.status === 'awarded').length,
    totalSubmissions: rfps.reduce((sum, rfp) => sum + rfp.submissions, 0),
    averageSubmissions: rfps.filter(rfp => rfp.submissions > 0).length > 0
      ? rfps.reduce((sum, rfp) => sum + rfp.submissions, 0) / rfps.filter(rfp => rfp.submissions > 0).length
      : 0
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Draft
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Published
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Closed
          </span>
        );
      case 'awarded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Awarded
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleViewRfp = (rfpId: string) => {
    onSelectRfp(rfpId);
    setShowRfpDetails(true);
  };

  const handleNotifyVendors = () => {
    setShowNotifyModal(true);
  };

  const handleSendNotification = async () => {
    if (!notificationRecipients) return;
    
    setIsSending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setNotificationSent(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setNotificationSent(false);
        setShowNotifyModal(false);
        setNotificationRecipients('');
        setNotificationMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {!selectedRfp ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Total RFPs</h3>
                <span className="text-2xl font-bold text-primary-600">{stats.totalRfps}</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Active</span>
                  <span className="font-medium text-gray-900">{stats.activeRfps}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(stats.activeRfps / stats.totalRfps) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Draft</span>
                  <span className="font-medium text-gray-900">{stats.draftRfps}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-500 h-2 rounded-full"
                    style={{ width: `${(stats.draftRfps / stats.totalRfps) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Closed/Awarded</span>
                  <span className="font-medium text-gray-900">{stats.closedRfps}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(stats.closedRfps / stats.totalRfps) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Submissions</h3>
                <span className="text-2xl font-bold text-primary-600">{stats.totalSubmissions}</span>
              </div>
              <div className="mt-4 text-center">
                <div className="text-3xl font-semibold text-gray-900">{stats.averageSubmissions.toFixed(1)}</div>
                <div className="text-sm text-gray-500">Average per RFP</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Deadlines</h3>
              <div className="space-y-4">
                {rfps
                  .filter(rfp => rfp.status === 'published')
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .slice(0, 3)
                  .map(rfp => (
                    <div key={rfp.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{rfp.title}</div>
                          <div className="text-xs text-gray-500">Due: {formatDate(rfp.dueDate)}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewRfp(rfp.id)}
                        className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                      >
                        View
                      </button>
                    </div>
                  ))}
                {rfps.filter(rfp => rfp.status === 'published').length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No active RFPs with upcoming deadlines
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent RFPs</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RFP
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submissions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rfps.map((rfp) => (
                  <tr key={rfp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{rfp.title}</div>
                          <div className="text-xs text-gray-500">{rfp.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{rfp.category}</div>
                      <div className="text-xs text-gray-500">{rfp.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(rfp.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(rfp.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rfp.submissions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            rfp.progress === 100 ? 'bg-green-500' :
                            rfp.progress >= 60 ? 'bg-blue-500' :
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${rfp.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{rfp.progress}% complete</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewRfp(rfp.id)}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                      >
                        View
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* RFP Detail View */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-gray-900">{selectedRfpData?.title}</h2>
                    <div className="ml-3">{getStatusBadge(selectedRfpData?.status || '')}</div>
                  </div>
                  <p className="text-gray-600 mt-1">{selectedRfpData?.id}</p>
                </div>
                <button
                  onClick={() => onSelectRfp('')}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600">{selectedRfpData?.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Details</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Category</span>
                            <span className="text-sm font-medium text-gray-900">{selectedRfpData?.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Department</span>
                            <span className="text-sm font-medium text-gray-900">{selectedRfpData?.department}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Budget</span>
                            <span className="text-sm font-medium text-gray-900">{selectedRfpData?.budget}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Timeline</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Published Date</span>
                            <span className="text-sm font-medium text-gray-900">{formatDate(selectedRfpData?.publishDate || '')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Due Date</span>
                            <span className="text-sm font-medium text-gray-900">{formatDate(selectedRfpData?.dueDate || '')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Days Remaining</span>
                            <span className="text-sm font-medium text-gray-900">
                              {selectedRfpData?.status === 'published' ? 
                                Math.max(0, Math.ceil((new Date(selectedRfpData.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) :
                                'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Progress</h3>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          className={`h-2.5 rounded-full ${
                            selectedRfpData?.progress === 100 ? 'bg-green-500' :
                            selectedRfpData?.progress && selectedRfpData.progress >= 60 ? 'bg-blue-500' :
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${selectedRfpData?.progress || 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Draft</span>
                        <span>Published</span>
                        <span>Evaluation</span>
                        <span>Awarded</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Submissions</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary-600">{selectedRfpData?.submissions || 0}</div>
                            <div className="text-sm text-gray-500 mt-1">Total Submissions</div>
                          </div>
                          {selectedRfpData?.status === 'published' && (
                            <button
                              onClick={() => window.location.hash = '#tools/rfp/submissions'}
                              className="w-full mt-4 text-sm text-primary-600 hover:text-primary-800 flex items-center justify-center"
                            >
                              View Submissions
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Actions</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <button
                            onClick={() => window.location.hash = '#tools/rfp/draft'}
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit RFP
                          </button>
                          {selectedRfpData?.status === 'published' && (
                            <button
                              onClick={handleNotifyVendors}
                              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Notify Vendors
                            </button>
                          )}
                          <button
                            onClick={() => window.location.hash = '#tools/rfp/analyze'}
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review RFP
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Timeline</h3>
                    <div className="space-y-4">
                      <div className="relative pl-6 pb-4 border-l-2 border-gray-200">
                        <div className="absolute -left-1.5 mt-1.5">
                          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">RFP Created</p>
                          <p className="text-xs text-gray-500">March 10, 2025</p>
                        </div>
                      </div>
                      
                      {selectedRfpData?.status !== 'draft' && (
                        <div className="relative pl-6 pb-4 border-l-2 border-gray-200">
                          <div className="absolute -left-1.5 mt-1.5">
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">RFP Published</p>
                            <p className="text-xs text-gray-500">{formatDate(selectedRfpData?.publishDate || '')}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedRfpData?.submissions > 0 && (
                        <div className="relative pl-6 pb-4 border-l-2 border-gray-200">
                          <div className="absolute -left-1.5 mt-1.5">
                            <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">First Submission Received</p>
                            <p className="text-xs text-gray-500">March 20, 2025</p>
                          </div>
                        </div>
                      )}
                      
                      {(selectedRfpData?.status === 'closed' || selectedRfpData?.status === 'awarded') && (
                        <div className="relative pl-6 pb-4 border-l-2 border-gray-200">
                          <div className="absolute -left-1.5 mt-1.5">
                            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">RFP Closed</p>
                            <p className="text-xs text-gray-500">{formatDate(selectedRfpData?.dueDate || '')}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedRfpData?.status === 'awarded' && (
                        <div className="relative pl-6 border-l-2 border-gray-200">
                          <div className="absolute -left-1.5 mt-1.5">
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Contract Awarded</p>
                            <p className="text-xs text-gray-500">March 15, 2025</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Key Stakeholders</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">John Smith</p>
                          <p className="text-xs text-gray-500">Project Manager</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                          <p className="text-xs text-gray-500">Procurement Specialist</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Michael Chen</p>
                          <p className="text-xs text-gray-500">Technical Lead</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showNotifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Notify Vendors</h3>
              <button
                onClick={() => setShowNotifyModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipients
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter email addresses, separated by commas"
                  value={notificationRecipients}
                  onChange={(e) => setNotificationRecipients(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  rows={4}
                  placeholder="Enter your message to vendors"
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowNotifyModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                disabled={isSending || !notificationRecipients || notificationSent}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : notificationSent ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Sent!
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RfpDashboard;