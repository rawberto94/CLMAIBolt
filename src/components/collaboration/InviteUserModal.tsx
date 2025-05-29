import React, { useState } from 'react';
import { X, Mail, Building2, Phone, Send, Check, AlertTriangle, RefreshCw } from 'lucide-react';

interface InviteUserModalProps {
  onClose: () => void;
}

interface InviteFormData {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  phone: string;
  message: string;
  type: 'internal' | 'supplier';
  permissions: string[];
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<InviteFormData>({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    role: '',
    phone: '',
    message: '',
    type: 'internal',
    permissions: []
  });

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.email) errors.push('Email is required');
    if (!formData.firstName) errors.push('First name is required');
    if (!formData.lastName) errors.push('Last name is required');
    if (formData.type === 'supplier' && !formData.company) errors.push('Company is required');
    if (!formData.role) errors.push('Role is required');
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setStatus('sending');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Sending invitation:', formData);
      
      setStatus('success');
      
      // Close modal after showing success state
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error sending invitation:', error);
      setStatus('error');
    }
  };

  const availablePermissions = {
    internal: [
      { id: 'view', label: 'View Documents' },
      { id: 'edit', label: 'Edit Documents' },
      { id: 'approve', label: 'Approve Changes' },
      { id: 'admin', label: 'Admin Access' }
    ],
    supplier: [
      { id: 'view_contracts', label: 'View Assigned Contracts' },
      { id: 'request_changes', label: 'Request Contract Changes' },
      { id: 'upload_docs', label: 'Upload Documents' }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-[7.5rem] px-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto transform transition-all duration-300 opacity-100 scale-100 mb-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Invite User</h2>
            <p className="mt-1 text-sm text-gray-500">
              Send an invitation to collaborate on contracts and documents
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    checked={formData.type === 'internal'}
                    onChange={() => setFormData(prev => ({ ...prev, type: 'internal' }))}
                  />
                  <span className="ml-2 text-sm text-gray-700">Internal User</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    checked={formData.type === 'supplier'}
                    onChange={() => setFormData(prev => ({ ...prev, type: 'supplier' }))}
                  />
                  <span className="ml-2 text-sm text-gray-700">Supplier</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name*
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  value={formData.firstName}
                  onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name*
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  value={formData.lastName}
                  onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            {formData.type === 'supplier' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    value={formData.company}
                    onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    required
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role*
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  value={formData.role}
                  onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  required
                >
                  <option value="">Select role...</option>
                  {formData.type === 'internal' ? (
                    <>
                      <option value="legal_admin">Legal Admin</option>
                      <option value="legal_counsel">Legal Counsel</option>
                      <option value="contract_manager">Contract Manager</option>
                      <option value="compliance_officer">Compliance Officer</option>
                    </>
                  ) : (
                    <>
                      <option value="supplier_admin">Supplier Admin</option>
                      <option value="account_manager">Account Manager</option>
                      <option value="legal_representative">Legal Representative</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="space-y-2">
                {availablePermissions[formData.type].map(permission => (
                  <label key={permission.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={formData.permissions.includes(permission.id)}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          permissions: e.target.checked
                            ? [...prev.permissions, permission.id]
                            : prev.permissions.filter(p => p !== permission.id)
                        }));
                      }}
                    />
                    <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invitation Message
              </label>
              <textarea
                className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="Add a personal message to the invitation..."
                value={formData.message}
                onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
              />
              <p className="mt-1 text-xs text-gray-500">
                This message will be included in the invitation email.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === 'sending' || status === 'success'}
              className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md flex items-center ${
                status === 'success'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-primary-600 hover:bg-primary-700'
              } disabled:opacity-50`}
            >
              {status === 'sending' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : status === 'success' ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Sent!
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;