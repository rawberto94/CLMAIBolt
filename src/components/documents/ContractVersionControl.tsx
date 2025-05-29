import React, { useState } from 'react';
import { GitBranch, GitMerge, GitPullRequest, Check, X } from 'lucide-react';
import type { Contract } from '../../types/Contract';

interface ContractVersionControlProps {
  contract: Contract;
  onApprove?: (versionId: string) => void;
  onReject?: (versionId: string, reason: string) => void;
}

const ContractVersionControl: React.FC<ContractVersionControlProps> = ({
  contract,
  onApprove,
  onReject
}) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState<string | null>(null);

  const handleReject = () => {
    if (selectedVersion && onReject) {
      onReject(selectedVersion, rejectReason);
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedVersion(null);
    }
  };

  return (
    <div className="space-y-6">
      {contract.versions && contract.versions.map((version) => (
        <div key={version.id} className="border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
            <div className="flex items-center">
              <GitBranch className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Version {version.version}</h3>
                <p className="text-xs text-gray-500">
                  Created by {version.createdBy} on {new Date(version.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {version.status === 'pending_review' && (
                <>
                  <button
                    onClick={() => onApprove?.(version.id)}
                    className="flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVersion(version.id);
                      setShowRejectDialog(true);
                    }}
                    className="flex items-center px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                </>
              )}
              {version.status === 'approved' && (
                <span className="flex items-center px-2 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                  <Check className="h-4 w-4 mr-1" />
                  Approved
                </span>
              )}
              {version.status === 'rejected' && (
                <span className="flex items-center px-2 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
                  <X className="h-4 w-4 mr-1" />
                  Rejected
                </span>
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-4">
              {version.changes.map((change, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{change.section}</h4>
                    <button
                      onClick={() => setShowDiff(showDiff === version.id ? null : version.id)}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      {showDiff === version.id ? 'Hide Changes' : 'View Changes'}
                    </button>
                  </div>
                  {showDiff === version.id && (
                    <div className="space-y-2">
                      <div className="bg-red-50 p-3 rounded text-sm">
                        <p className="line-through text-red-700">{change.oldText}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded text-sm">
                        <p className="text-green-700">{change.newText}</p>
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">{change.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      
      {(!contract.versions || contract.versions.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          No version history available for this contract.
        </div>
      )}

      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Reject Version</h3>
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setSelectedVersion(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700">
                Reason for Rejection
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this version..."
              />

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectDialog(false);
                    setSelectedVersion(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Reject Version
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractVersionControl;