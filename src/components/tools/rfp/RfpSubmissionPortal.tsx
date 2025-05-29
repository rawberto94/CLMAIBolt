import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  Eye, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Users, 
  Mail, 
  MessageSquare, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Filter,
  Search
} from 'lucide-react';

interface RfpSubmissionPortalProps {
  selectedRfp: string | null;
}

interface Submission {
  id: string;
  vendorName: string;
  vendorEmail: string;
  submissionDate: string;
  status: 'new' | 'under_review' | 'shortlisted' | 'rejected';
  documents: Array<{
    id: string;
    name: string;
    size: string;
    type: string;
  }>;
  score?: number;
  notes?: string;
  isExpanded: boolean;
}

const RfpSubmissionPortal: React.FC<RfpSubmissionPortalProps> = ({ selectedRfp }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: 'sub-1',
      vendorName: 'Acme Solutions Inc.',
      vendorEmail: 'proposals@acmesolutions.com',
      submissionDate: '2025-03-25T14:30:00',
      status: 'under_review',
      documents: [
        { id: 'doc-1', name: 'Technical Proposal.pdf', size: '2.4 MB', type: 'pdf' },
        { id: 'doc-2', name: 'Cost Proposal.pdf', size: '1.1 MB', type: 'pdf' },
        { id: 'doc-3', name: 'Company Profile.pdf', size: '3.5 MB', type: 'pdf' }
      ],
      score: 85,
      notes: 'Strong technical proposal with comprehensive implementation plan. Pricing is within budget but on the higher end.',
      isExpanded: false
    },
    {
      id: 'sub-2',
      vendorName: 'TechPro Systems',
      vendorEmail: 'bids@techprosystems.com',
      submissionDate: '2025-03-26T09:15:00',
      status: 'shortlisted',
      documents: [
        { id: 'doc-4', name: 'TechPro ERP Proposal.pdf', size: '4.2 MB', type: 'pdf' },
        { id: 'doc-5', name: 'Financial Offer.xlsx', size: '0.8 MB', type: 'xlsx' }
      ],
      score: 92,
      notes: 'Excellent proposal with innovative approach. Pricing is competitive and they have relevant experience in our industry.',
      isExpanded: false
    },
    {
      id: 'sub-3',
      vendorName: 'Global IT Services',
      vendorEmail: 'proposals@globalitservices.com',
      submissionDate: '2025-03-27T16:45:00',
      status: 'new',
      documents: [
        { id: 'doc-6', name: 'GIS Proposal Package.zip', size: '8.7 MB', type: 'zip' }
      ],
      isExpanded: false
    },
    {
      id: 'sub-4',
      vendorName: 'Enterprise Solutions Group',
      vendorEmail: 'rfp@enterprisesolutions.com',
      submissionDate: '2025-03-28T11:20:00',
      status: 'rejected',
      documents: [
        { id: 'doc-7', name: 'ESG Response.pdf', size: '5.1 MB', type: 'pdf' },
        { id: 'doc-8', name: 'Cost Breakdown.xlsx', size: '1.2 MB', type: 'xlsx' }
      ],
      score: 65,
      notes: 'Proposal does not meet several key requirements. Implementation timeline is too long and pricing exceeds budget.',
      isExpanded: false
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showVendorInviteModal, setShowVendorInviteModal] = useState(false);
  const [vendorEmails, setVendorEmails] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const [invitesSent, setInvitesSent] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showSubmissionDetails, setShowSubmissionDetails] = useState(false);
  const [submissionNote, setSubmissionNote] = useState('');
  const [submissionScore, setSubmissionScore] = useState<number | undefined>(undefined);
  const [submissionStatus, setSubmissionStatus] = useState<string>('');
  const [isSavingSubmission, setIsSavingSubmission] = useState(false);

  const toggleSubmissionExpand = (submissionId: string) => {
    setSubmissions(prev => prev.map(submission => 
      submission.id === submissionId 
        ? { ...submission, isExpanded: !submission.isExpanded } 
        : submission
    ));
  };

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setSubmissionNote(submission.notes || '');
    setSubmissionScore(submission.score);
    setSubmissionStatus(submission.status);
    setShowSubmissionDetails(true);
  };

  const handleSendInvites = async () => {
    if (!vendorEmails.trim()) return;
    
    setIsSendingInvites(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setInvitesSent(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setInvitesSent(false);
        setShowVendorInviteModal(false);
        setVendorEmails('');
        setInviteMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error sending invites:', error);
    } finally {
      setIsSendingInvites(false);
    }
  };

  const handleSaveSubmissionDetails = async () => {
    if (!selectedSubmission) return;
    
    setIsSavingSubmission(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the submission in the list
      setSubmissions(prev => prev.map(submission => 
        submission.id === selectedSubmission.id 
          ? { 
              ...submission, 
              notes: submissionNote, 
              score: submissionScore,
              status: submissionStatus as any
            } 
          : submission
      ));
      
      // Close the modal
      setShowSubmissionDetails(false);
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Error saving submission details:', error);
    } finally {
      setIsSavingSubmission(false);
    }
  };

  // Filter submissions based on search query and selected statuses
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.vendorEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(submission.status);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            New
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Under Review
          </span>
        );
      case 'shortlisted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Shortlisted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'xlsx':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'zip':
        return <FileText className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Upload className="h-5 w-5 mr-2 text-primary-600" />
            RFP Submission Portal
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage vendor submissions and evaluate proposals
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowVendorInviteModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Mail className="h-4 w-4 mr-2" />
            Invite Vendors
          </button>
          <button
            onClick={() => setShowSubmissionModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Add Submission
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
              placeholder="Search submissions by vendor name or email..."
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <button
              className="w-full md:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {selectedStatuses.length > 0 && (
                <span className="ml-1 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {selectedStatuses.length}
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Status</h3>
                  <div className="space-y-2">
                    {['new', 'under_review', 'shortlisted', 'rejected'].map((status) => (
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
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {status.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      className="text-sm text-gray-600 hover:text-gray-900"
                      onClick={() => setSelectedStatuses([])}
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
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No submissions found</h3>
            <p className="text-gray-500 mt-1">
              {selectedStatuses.length > 0 || searchQuery
                ? 'No submissions match your current filter criteria.'
                : 'There are no submissions for this RFP yet.'}
            </p>
            {!(selectedStatuses.length > 0 || searchQuery) && (
              <button
                onClick={() => setShowVendorInviteModal(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Mail className="h-4 w-4 mr-2" />
                Invite Vendors
              </button>
            )}
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <div key={submission.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">{submission.vendorName}</h3>
                      <div className="ml-3">
                        {getStatusBadge(submission.status)}
                      </div>
                      {submission.score !== undefined && (
                        <div className="ml-3 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          Score: {submission.score}/100
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{submission.vendorEmail}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted: {formatDate(submission.submissionDate)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewSubmission(submission)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => toggleSubmissionExpand(submission.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {submission.isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {submission.isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Submitted Documents</h4>
                    <div className="space-y-2">
                      {submission.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            {getFileIcon(doc.type)}
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">{doc.size}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-primary-600 hover:text-primary-900">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {submission.notes && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">{submission.notes}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleViewSubmission(submission)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showVendorInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Invite Vendors</h3>
              <button
                onClick={() => {
                  setShowVendorInviteModal(false);
                  setVendorEmails('');
                  setInviteMessage('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Email Addresses
                </label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  rows={4}
                  placeholder="Enter email addresses, separated by commas"
                  value={vendorEmails}
                  onChange={(e) => setVendorEmails(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Each vendor will receive an invitation to submit a proposal for this RFP.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invitation Message (Optional)
                </label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  rows={4}
                  placeholder="Enter a custom message to include in the invitation"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowVendorInviteModal(false);
                  setVendorEmails('');
                  setInviteMessage('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvites}
                disabled={isSendingInvites || !vendorEmails.trim() || invitesSent}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
              >
                {isSendingInvites ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : invitesSent ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Sent!
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitations
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add Vendor Submission</h3>
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter vendor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter vendor email"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Documents
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                        <span>Upload files</span>
                        <input
                          type="file"
                          className="sr-only"
                          multiple
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOCX, XLSX, ZIP up to 50MB
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Enter any notes about this submission"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
              >
                Add Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmissionDetails && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Submission Details</h3>
              <button
                onClick={() => {
                  setShowSubmissionDetails(false);
                  setSelectedSubmission(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{selectedSubmission.vendorName}</h4>
                      <p className="text-sm text-gray-500">{selectedSubmission.vendorEmail}</p>
                      <div className="flex items-center mt-2">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500">
                          Submitted: {formatDate(selectedSubmission.submissionDate)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Documents</h4>
                      <div className="space-y-2">
                        {selectedSubmission.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              {getFileIcon(doc.type)}
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                <p className="text-xs text-gray-500">{doc.size}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="text-primary-600 hover:text-primary-900">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-primary-600 hover:text-primary-900">
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Evaluation Notes</h4>
                      <textarea
                        className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        rows={4}
                        value={submissionNote}
                        onChange={(e) => setSubmissionNote(e.target.value)}
                        placeholder="Enter evaluation notes for this submission"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Evaluation</h4>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        value={submissionStatus}
                        onChange={(e) => setSubmissionStatus(e.target.value)}
                      >
                        <option value="new">New</option>
                        <option value="under_review">Under Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Score (0-100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        value={submissionScore || ''}
                        onChange={(e) => setSubmissionScore(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                    
                    {submissionScore !== undefined && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                          <div
                            className={`h-2.5 rounded-full ${
                              submissionScore >= 80 ? 'bg-green-500' :
                              submissionScore >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${submissionScore}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Actions</h4>
                    <div className="space-y-2">
                      <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Vendor
                      </button>
                      <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Request Clarification
                      </button>
                      <button
                        onClick={() => window.location.hash = '#tools/rfp/evaluate'}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Evaluate Proposal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowSubmissionDetails(false);
                  setSelectedSubmission(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubmissionDetails}
                disabled={isSavingSubmission}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
              >
                {isSavingSubmission ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Changes
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

export default RfpSubmissionPortal;