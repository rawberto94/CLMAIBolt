import React, { useState } from 'react';
import { X, Upload, AlertTriangle, FileText, Download, Calendar, Tag, Briefcase, MessageSquare, Plus, Check, RefreshCw, Mail } from 'lucide-react';
import TaxonomyFilter from '../shared/TaxonomyFilter';

interface SupplierChatModalProps {
  onClose: () => void;
}

const SupplierChatModal: React.FC<SupplierChatModalProps> = ({ onClose }) => {
  const [selectedContract, setSelectedContract] = useState('');
  const [changeType, setChangeType] = useState<'amendment' | 'termination' | 'renewal'>('amendment');
  const [description, setDescription] = useState('');
  const [selectedL1, setSelectedL1] = useState<string[]>([]);
  const [selectedL2, setSelectedL2] = useState<string[]>([]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [changeDetails, setChangeDetails] = useState<Array<{
    section: string;
    currentText: string;
    proposedText: string;
    reason: string;
  }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierDetails, setSupplierDetails] = useState({
    name: '',
    role: '',
    company: '',
    phone: '',
    message: ''
  });
  const [notificationSent, setNotificationSent] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [invitationStatus, setInvitationStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log({
      contract: selectedContract,
      changeType,
      category: {
        l1: selectedL1,
        l2: selectedL2
      },
      description,
      priority,
      dueDate,
      attachments,
      supplierEmail
    });
    
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      window.location.hash = '#collaboration';
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleNotify = async () => {
    if (!supplierEmail || !supplierDetails.name) return;
    
    setInvitationStatus('sending');
    
    try {
      // Simulate API call to send notification
      const inviteData = {
        email: supplierEmail,
        name: supplierDetails.name,
        role: supplierDetails.role,
        company: supplierDetails.company,
        phone: supplierDetails.phone,
        message: supplierDetails.message || 'You have been invited to participate in a contract change request.',
        contractId: selectedContract
      };
      
      console.log('Sending invitation:', inviteData);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setInvitationStatus('success');
      setNotificationSent(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setNotificationSent(false);
        setShowInviteForm(false);
        setInvitationStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error sending notification:', error);
      setInvitationStatus('error');
    }
  };

  const renderInviteForm = () => (
    <div className="space-y-4 bg-gray-50 p-6 rounded-lg mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier Name*
          </label>
          <input
            type="text"
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter supplier's name"
            value={supplierDetails.name}
            onChange={(e) => setSupplierDetails(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter company name"
            value={supplierDetails.company}
            onChange={(e) => setSupplierDetails(prev => ({ ...prev, company: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role*
        </label>
        <input
          type="text"
          className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., Contract Manager, Legal Representative"
          value={supplierDetails.role}
          onChange={(e) => setSupplierDetails(prev => ({ ...prev, role: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
          placeholder="+1 (555) 123-4567"
          value={supplierDetails.phone}
          onChange={(e) => setSupplierDetails(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Custom Message
        </label>
        <textarea
          className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
          rows={3}
          placeholder="Add a personal message to the invitation..."
          value={supplierDetails.message}
          onChange={(e) => setSupplierDetails(prev => ({ ...prev, message: e.target.value }))}
        />
        <p className="mt-1 text-xs text-gray-500">
          This message will be included in the invitation email sent to the supplier.
        </p>
      </div>
      
      {invitationStatus === 'error' && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Failed to send invitation. Please try again.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-100 text-red-800 ring-red-600';
      case 'medium': return 'bg-yellow-100 text-yellow-800 ring-yellow-600';
      case 'low': return 'bg-green-100 text-green-800 ring-green-600';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-[7.5rem] px-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto transform transition-all duration-300 opacity-100 scale-100 mb-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">New Contract Change Request</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Contract
            </label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
              required
            >
              <option value="">Select a contract...</option>
              <option value="1">Master Service Agreement - Acme Corp</option>
              <option value="2">Software License Agreement - Tech Systems</option>
              <option value="3">Supply Agreement - Global Supplies Inc.</option>
            </select>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invite Supplier
              </label>
              <input
                type="email"
                className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter supplier's email address"
                value={supplierEmail}
                onChange={(e) => {
                  setSupplierEmail(e.target.value);
                  if (!showInviteForm) setShowInviteForm(true);
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleNotify}
              disabled={!supplierEmail || !supplierDetails.name || !supplierDetails.role || invitationStatus === 'sending' || notificationSent}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-all duration-200 ${
                notificationSent
                  ? 'bg-green-500 cursor-default'
                  : 'bg-primary-600 hover:bg-primary-700'
              } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-[38px]`}
            >
              {invitationStatus === 'sending' ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : invitationStatus === 'success' ? (
                <>
                  <Check className="h-4 w-4" />
                  Sent!
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-1" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
          
          {showInviteForm && renderInviteForm()}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Change Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                className={`p-4 border rounded-lg text-center ${
                  changeType === 'amendment'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setChangeType('amendment')}
              >
                <FileText className="h-6 w-6 mx-auto mb-2" />
                Amendment
              </button>
              <button
                type="button"
                className={`p-4 border rounded-lg text-center ${
                  changeType === 'renewal'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setChangeType('renewal')}
              >
                <Calendar className="h-6 w-6 mx-auto mb-2" />
                Renewal
              </button>
              <button
                type="button"
                className={`p-4 border rounded-lg text-center ${
                  changeType === 'termination'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setChangeType('termination')}
              >
                <X className="h-6 w-6 mx-auto mb-2" />
                Termination
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <TaxonomyFilter
              selectedL1={selectedL1}
              selectedL2={selectedL2}
              onL1Change={setSelectedL1}
              onL2Change={setSelectedL2}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Change Description
            </label>
            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              rows={4}
              placeholder="Describe the requested changes in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="flex space-x-2">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p as 'low' | 'medium' | 'high')}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      priority === p 
                        ? `${getPriorityColor(p)} ring-2` 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Change Details
            </label>
            {changeDetails.map((detail, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Section</label>
                    <input
                      type="text"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      value={detail.section}
                      onChange={(e) => {
                        const newDetails = [...changeDetails];
                        newDetails[index].section = e.target.value;
                        setChangeDetails(newDetails);
                      }}
                      placeholder="e.g., Section 5.3"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Reason for Change</label>
                    <input
                      type="text"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      value={detail.reason}
                      onChange={(e) => {
                        const newDetails = [...changeDetails];
                        newDetails[index].reason = e.target.value;
                        setChangeDetails(newDetails);
                      }}
                      placeholder="Why is this change needed?"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Current Text</label>
                    <textarea
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                      value={detail.currentText}
                      onChange={(e) => {
                        const newDetails = [...changeDetails];
                        newDetails[index].currentText = e.target.value;
                        setChangeDetails(newDetails);
                      }}
                      placeholder="Current contract text..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Proposed Text</label>
                    <textarea
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                      value={detail.proposedText}
                      onChange={(e) => {
                        const newDetails = [...changeDetails];
                        newDetails[index].proposedText = e.target.value;
                        setChangeDetails(newDetails);
                      }}
                      placeholder="Proposed new text..."
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setChangeDetails(changeDetails.filter((_, i) => i !== index));
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove Change
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setChangeDetails([
                  ...changeDetails,
                  { section: '', currentText: '', proposedText: '', reason: '' }
                ]);
              }}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Another Change
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Documents
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
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX up to 10MB
                </p>
              </div>
            </div>
            {attachments.length > 0 && (
              <ul className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-500">
                    <FileText className="h-4 w-4 mr-2" />
                    {file.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedContract || !description}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Change Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierChatModal;