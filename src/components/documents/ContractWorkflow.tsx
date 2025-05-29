import React, { useState } from 'react';
import { Check, Clock, AlertTriangle, X, ChevronRight, User, Shield } from 'lucide-react';
import type { Contract } from '../../types/Contract';

interface ContractWorkflowProps {
  contract: Contract;
  onApprove: (stage: string) => void;
  onReject: (stage: string, reason: string) => void;
}

const ContractWorkflow: React.FC<ContractWorkflowProps> = ({
  contract,
  onApprove,
  onReject
}) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectStage, setRejectStage] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const getStageStatus = (stage: string) => {
    const approval = contract.approvals.find(a => a.stage === stage);
    return {
      status: approval?.status || 'pending',
      date: approval?.date,
      approver: approval?.approver,
      comments: approval?.comments
    };
  };

  const handleReject = () => {
    onReject(rejectStage, rejectReason);
    setShowRejectDialog(false);
    setRejectStage('');
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        
        <div className="relative flex justify-between">
          {['Draft', 'Legal Review', 'Business Review', 'Final Approval'].map((stage, index) => {
            const { status, date } = getStageStatus(stage);
            return (
              <div key={stage} className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  status === 'approved' ? 'bg-green-500' :
                  status === 'rejected' ? 'bg-red-500' :
                  status === 'pending' ? 'bg-gray-200' :
                  'bg-primary-500'
                }`}>
                  {status === 'approved' && <Check className="w-5 h-5 text-white" />}
                  {status === 'rejected' && <X className="w-5 h-5 text-white" />}
                  {status === 'pending' && <Clock className="w-5 h-5 text-gray-400" />}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium text-gray-900">{stage}</div>
                  {date && (
                    <div className="text-xs text-gray-500">
                      {new Date(date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {contract.approvals.map((approval) => (
          <div key={approval.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  approval.status === 'approved' ? 'bg-green-100' :
                  approval.status === 'rejected' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  {approval.status === 'approved' ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : approval.status === 'rejected' ? (
                    <X className="w-5 h-5 text-red-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{approval.stage}</h3>
                  <p className="text-xs text-gray-500">Approver: {approval.approver}</p>
                </div>
              </div>
              
              {approval.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => onApprove(approval.stage)}
                    className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setRejectStage(approval.stage);
                      setShowRejectDialog(true);
                    }}
                    className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
            
            {approval.comments && (
              <div className="mt-3 text-sm text-gray-600">
                <p className="font-medium">Comments:</p>
                <p>{approval.comments}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Reject {rejectStage}</h3>
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectStage('');
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
                placeholder="Please provide a reason for rejecting this stage..."
              />

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectStage('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractWorkflow;