import React, { useState } from 'react';
import { MessageSquare, Send, ThumbsUp, Reply, MoreHorizontal, X } from 'lucide-react';
import { Comment } from '../../types/Comment';

interface DocumentCommentsProps {
  searchQuery: string;
  mode?: 'internal' | 'supplier' | 'client';
  selectedL1?: string[];
  selectedL2?: string[];
  selectedL1?: string[];
  selectedL2?: string[];
  onApprove?: (commentId: string) => void;
  onReject?: (commentId: string, reason: string) => void;
  onRequestChanges?: (commentId: string, changes: string) => void;
}

interface ChangeRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  version: string;
  changes: Array<{
    section: string;
    oldText: string;
    newText: string;
    reason: string;
  }>;
  approvers: Array<{
    id: string;
    name: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    comment?: string;
  }>;
}

const commentData: Comment[] = [
  {
    id: 'comment1',
    documentId: 'doc1',
    documentName: 'Master Service Agreement - Acme Corp',
    category: {
      l1: 'Professional Services',
      l2: 'Consulting'
    },
    user: {
      id: 'user1',
      name: 'Jane Smith',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=120',
    },
    text: 'We need to revise section 5.3 regarding the payment terms to align with our updated financial policies.',
    timestamp: '2025-03-20T10:30:00',
    page: 4,
    likes: 2,
    replies: [
      {
        id: 'reply1',
        user: {
          id: 'user7',
          name: 'John Doe',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120',
        },
        text: 'I agree. Let me draft the updated language and circulate it for review.',
        timestamp: '2025-03-20T11:15:00',
      },
    ],
  },
  {
    id: 'comment2',
    documentId: 'doc3',
    documentName: 'GDPR Compliance Report - Q1 2025',
    category: {
      l1: 'Legal Services',
      l2: 'Legal Services'
    },
    user: {
      id: 'user4',
      name: 'Mike Johnson',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=120',
    },
    text: 'The data retention policy described on page 12 needs to be updated to reflect the new EU regulations that went into effect this quarter.',
    timestamp: '2025-03-19T16:45:00',
    page: 12,
    likes: 4,
    replies: [],
  },
  {
    id: 'comment3',
    documentId: 'doc5',
    documentName: 'Software License Agreement - Tech Systems',
    category: {
      l1: 'IT',
      l2: 'Software'
    },
    user: {
      id: 'user3',
      name: 'Sarah Zhang',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120',
    },
    text: 'The liability clause needs to be updated to include the new regulations that went into effect this quarter.',
    timestamp: '2025-03-19T11:20:00',
    page: 8,
    likes: 1,
    replies: [
      {
        id: 'reply2',
        user: {
          id: 'user2',
          name: 'Robert Wilson',
          avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=120',
        },
        text: 'Good catch. I\'ll coordinate with the legal team to update this section.',
        timestamp: '2025-03-19T13:05:00',
      },
      {
        id: 'reply3',
        user: {
          id: 'user7',
          name: 'John Doe',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120',
        },
        text: 'I\'ve prepared a draft of the updated language. Will share it in the next team meeting.',
        timestamp: '2025-03-19T15:30:00',
      },
    ],
  },
];

const DocumentComments: React.FC<DocumentCommentsProps> = ({ 
  searchQuery, 
  mode = 'internal',
  selectedL1 = [],
  selectedL2 = []
}) => {
  const [replyToComment, setReplyToComment] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [actionMenuComment, setActionMenuComment] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState<string | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestedChanges, setRequestedChanges] = useState('');

  // Filter comments based on search query and category filters
  const filteredComments = commentData.filter((comment) => {
    // Apply search filter
    const matchesSearch = 
      comment.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.replies.some(reply => reply.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    reply.user.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply category filters
    const matchesL1 = selectedL1.length === 0 || (comment.category && selectedL1.includes(comment.category.l1));
    const matchesL2 = selectedL2.length === 0 || (comment.category && selectedL2.includes(comment.category.l2));
    
    return matchesSearch && matchesL1 && matchesL2;
  });

  const toggleReply = (commentId: string) => {
    setReplyToComment(replyToComment === commentId ? null : commentId);
    setReplyText('');
  };

  const handleSubmitReply = (commentId: string) => {
    // Here you would normally submit the reply to an API
    console.log(`Submitting reply to comment ${commentId}: ${replyText}`);
    setReplyText('');
    setReplyToComment(null);
  };

  const toggleActionMenu = (commentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionMenuComment(actionMenuComment === commentId ? null : commentId);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {filteredComments.length === 0 ? (
        mode === 'internal' ? (
          <div className="p-6 text-center text-gray-500">
            No comments found matching your search criteria.
          </div>
        ) : mode === 'supplier' ? (
          <div className="p-6 text-center text-gray-500">
            No contract change requests found matching your search criteria.
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No client requests found matching your search criteria.
          </div>
        )
      ) : (
        filteredComments.map((comment) => (
          <div key={comment.id} className="p-4">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full"
                  src={comment.user.avatar}
                  alt={comment.user.name}
                />
              </div>
              <div className="flex-grow">
                <div className="text-sm">
                  <a href="#user" className="font-medium text-gray-900">
                    {comment.user.name}
                  </a>
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                    <p>{comment.text}</p>
                    {(mode === 'supplier' || mode === 'client') && (
                      <div className="mt-4 flex items-center space-x-4">
                        <button
                          onClick={() => setShowDiff(comment.id)}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          View Changes
                        </button>
                        <button
                          onClick={() => setShowApprovalDialog(true)}
                          className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setShowApprovalDialog(true)}
                          className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setShowApprovalDialog(true)}
                          className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Request Changes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
      
      {showDiff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Document Changes</h3>
              <button onClick={() => setShowDiff(null)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Section 5.3 - Payment Terms</h4>
                <div className="space-y-2">
                  <div className="bg-red-50 p-2 rounded text-sm line-through">
                    Payment shall be made within 30 days of invoice receipt.
                  </div>
                  <div className="bg-green-50 p-2 rounded text-sm">
                    Payment shall be made within 45 days of invoice receipt, with a 2% discount for payments made within 15 days.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showApprovalDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 p-6">
            <div className="space-y-4">
              <textarea
                className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                rows={4}
                placeholder="Add your comments..."
                value={rejectionReason || requestedChanges}
                onChange={(e) => {
                  if (rejectionReason) setRejectionReason(e.target.value);
                  if (requestedChanges) setRequestedChanges(e.target.value);
                }}
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowApprovalDialog(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentComments;