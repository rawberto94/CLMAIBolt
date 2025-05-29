import React, { useState } from 'react';
import { User, Clock, Download, Share2, MessageSquare, Send, Eye, AlertCircle, X, FileText } from 'lucide-react';

interface Comment {
  id: string;
  text: string;
  user: {
    name: string;
    avatar: string;
  };
  timestamp: string;
  type: 'internal' | 'external';
  highlightedText: string;
  position?: {
    page: number;
    paragraph: number;
    offset: number;
    length: number;
  };
}

interface DocumentViewerProps {
  documentId: string;
  documentName?: string;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentId, documentName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'internal' | 'external'>('internal');
  const [selectedText, setSelectedText] = useState<string>('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);
  const [selectionPosition, setSelectionPosition] = useState<{page: number, paragraph: number, offset: number, length: number} | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<{text: string, type: 'internal' | 'external'} | null>(null);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'comment1',
      text: 'We should revise this section to align with our updated policies.',
      user: {
        name: 'Jane Smith',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=120'
      },
      timestamp: '2025-03-20T14:30:00',
      type: 'internal',
      highlightedText: 'This text has an internal comment attached to it.',
      position: {
        page: 1,
        paragraph: 2,
        offset: 10,
        length: 47
      }
    },
    {
      id: 'comment2',
      text: 'Can we clarify the implications of this term?',
      user: {
        name: 'Mike Johnson',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=120'
      },
      timestamp: '2025-03-20T09:15:00',
      type: 'external',
      highlightedText: 'Term 3: This term has an external comment from a client',
      position: {
        page: 1,
        paragraph: 5,
        offset: 0,
        length: 56
      }
    }
  ]);

  // Simulate document loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Function to handle clicking on text with comments
  const handleCommentClick = (commentId: string) => {
    setActiveCommentId(commentId);
    
    // Find the comment and scroll to its position in the document
    const comment = comments.find(c => c.id === commentId);
    if (comment && comment.position) {
      const element = document.querySelector(`[data-comment-id="${commentId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a pulse animation to highlight the text
        element.classList.add('highlight-pulse-focus');
        setTimeout(() => {
          element.classList.remove('highlight-pulse-focus');
        }, 2000);
      }
    }
  };

  // Function to handle text selection for adding comments
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const text = selection.toString();
      setSelectedText(text);
      
      // Get the position information
      const range = selection.getRangeAt(0);
      const container = range.startContainer.parentElement;
      
      // Find the paragraph number
      let paragraph = 0;
      let current = container;
      while (current && current.previousElementSibling) {
        paragraph++;
        current = current.previousElementSibling;
      }
      
      setSelectionPosition({
        page: 1, // Assuming single page for simplicity
        paragraph,
        offset: range.startOffset,
        length: text.length
      });
      
      setIsAddingComment(true);
    }
  };

  // Function to handle submitting a new comment
  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    // Generate a unique ID for the new comment
    const newCommentId = `comment${Date.now()}`;
    
    const newCommentObj: Comment = {
      id: newCommentId,
      text: newComment,
      user: {
        name: 'Current User',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120'
      },
      timestamp: new Date().toISOString(),
      type: commentType,
      highlightedText: selectedText,
      position: selectionPosition || undefined
    };
    
    setComments([...comments, newCommentObj]);
    setActiveCommentId(newCommentObj.id);
    
    // Add the highlight to the document
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.dataset.commentId = newCommentId;
        span.dataset.commentType = commentType;
        span.className = commentType === 'internal' ? 'highlight-internal' : 'highlight-external';
        span.textContent = selectedText;
        
        // Replace the selected text with our highlighted span
        range.deleteContents();
        range.insertNode(span);
        
        // Add click handler to the new span
        span.addEventListener('click', () => handleCommentClick(newCommentId));
      }
    }
    
    // Reset form
    setNewComment('');
    setSelectedText('');
    setIsAddingComment(false);
    setSelectionPosition(null);
  };

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.round(diffMins / 60)}h ago`;
    } else {
      return `${Math.round(diffMins / 1440)}d ago`;
    }
  };

  // Handle hovering over a comment
  const handleCommentHover = (commentId: string, isHovering: boolean) => {
    setHoveredCommentId(isHovering ? commentId : null);
    
    // Highlight the corresponding text in the document
    const element = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (element) {
      if (isHovering) {
        element.classList.add('highlight-pulse');
      } else {
        element.classList.remove('highlight-pulse');
      }
    }
  };
  
  // Handle hovering over highlighted text in the document
  const handleTextHover = (commentId: string, isHovering: boolean) => {
    if (isHovering) {
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        setPreviewContent({
          text: comment.text,
          type: comment.type
        });
        setShowPreview(true);
      }
    } else {
      setShowPreview(false);
      setPreviewContent(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{documentName || 'Document Viewer'}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="flex-1 flex">
              <div 
                className="flex-1 overflow-auto document-content p-6"
                onMouseUp={handleTextSelection}
              >
                <div className="max-w-4xl mx-auto bg-white p-8 document-page">
                  <div className="pb-5 border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-gray-900">{documentName || 'Document Title'}</h1>
                    <p className="mt-2 text-sm text-gray-500 flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-gray-400" />
                      Document ID: {documentId}
                    </p>
                  </div>
                  <div className="mt-8 prose max-w-none">
                    <p>This is a sample document content. In a real implementation, the actual document content would be loaded here.</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.</p>
                    <p>Sed euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.</p>
                    <h2>Section 1: Introduction</h2>
                    <p>This section introduces the main concepts of the document.</p>
                    <p>
                      <span 
                        data-comment-type="internal" 
                        data-comment-id="comment1" 
                        className="highlight-internal"
                        onClick={() => handleCommentClick('comment1')}
                        onMouseEnter={() => handleTextHover('comment1', true)}
                        onMouseLeave={() => handleTextHover('comment1', false)}
                      >This text has an internal comment attached to it.</span> Regular text continues here.
                    </p>
                    <h2>Section 2: Terms and Conditions</h2>
                    <p>The following terms and conditions apply to this agreement:</p>
                    <ul>
                      <li>Term 1: Lorem ipsum dolor sit amet</li>
                      <li>Term 2: Consectetur adipiscing elit</li>
                      <li>
                        <span 
                          data-comment-type="external" 
                          data-comment-id="comment2" 
                          className="highlight-external"
                          onClick={() => handleCommentClick('comment2')}
                          onMouseEnter={() => handleTextHover('comment2', true)}
                          onMouseLeave={() => handleTextHover('comment2', false)}
                        >Term 3: This term has an external comment from a client</span>
                      </li>
                      <li>Term 4: Sed do eiusmod tempor incididunt</li>
                    </ul>
                  </div>
                </div>
                
                {/* Floating comment preview */}
                {showPreview && previewContent && (
                  <div 
                    className={`fixed p-3 rounded-lg shadow-lg max-w-xs z-50 ${
                      previewContent.type === 'internal' 
                        ? 'bg-yellow-50 border border-yellow-200' 
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                    style={{
                      left: `${Math.min(window.innerWidth - 300, Math.max(100, window.event?.clientX || 300))}px`,
                      top: `${Math.min(window.innerHeight - 100, Math.max(100, (window.event?.clientY || 300) - 50))}px`
                    }}
                  >
                    <div className="text-xs text-gray-700">{previewContent.text}</div>
                  </div>
                )}
              </div>
              
              <div className="w-96 overflow-y-auto border-l border-gray-200 bg-white p-4">
                <div className="pb-16 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Metadata</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center text-xs">
                        <User className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-gray-500">Last edited by</span>
                        <span className="font-medium text-gray-900 ml-1">Jane Smith</span>
                      </div>
                      <div className="flex items-center text-xs">
                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-gray-500">Last modified</span>
                        <span className="font-medium text-gray-900 ml-1">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Comments</h4>
                    <div className="mt-2 space-y-3 mb-4">
                      {comments.map(comment => (
                        <div
                          key={comment.id}
                          className={`p-3 bg-gray-50 rounded-lg border-l-4 ${
                            comment.type === 'internal' 
                              ? activeCommentId === comment.id 
                                ? 'border-yellow-500 ring-2 ring-yellow-200' 
                                : 'border-yellow-500'
                              : activeCommentId === comment.id 
                                ? 'border-blue-500 ring-2 ring-blue-200' 
                                : 'border-blue-500'
                          } cursor-pointer transition-all duration-200 ${
                            hoveredCommentId === comment.id ? 'transform -translate-y-1 shadow-md' : ''
                          }`}
                          onClick={() => handleCommentClick(comment.id)}
                          onMouseEnter={() => handleCommentHover(comment.id, true)}
                          onMouseLeave={() => handleCommentHover(comment.id, false)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <img src={comment.user.avatar} alt={comment.user.name} className="h-5 w-5 rounded-full" />
                              <span className="text-xs font-medium text-gray-900 ml-1">{comment.user.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
                          </div>
                          <p className="text-xs text-gray-700">{comment.text}</p>
                          <div className="mt-1 relative">
                            <div className={`text-xs ${comment.type === 'internal' ? 'bg-yellow-50' : 'bg-blue-50'} p-1 rounded highlighted-text`}>
                              {comment.highlightedText}
                            </div>
                            <div className="absolute right-0 bottom-0 flex space-x-1">
                              <button 
                                className="p-1 text-xs text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-100"
                                title="Go to text"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCommentClick(comment.id);
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Selected text for new comment */}
                    {selectedText && isAddingComment && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-900">Selected Text</span>
                          <button 
                            className="text-xs text-gray-500 hover:text-gray-700"
                            onClick={() => {
                              setSelectedText('');
                              setIsAddingComment(false);
                              setSelectionPosition(null);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="mt-1 text-xs bg-gray-100 p-1 rounded highlighted-text">
                          {selectedText}
                        </div>
                      </div>
                    )}

                    {/* Add new comment section */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Add Comment</h4>
                        <div className="ml-auto flex space-x-1">
                          <button 
                            className={`px-2 py-1 text-xs font-medium rounded-md ${
                              commentType === 'internal' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            onClick={() => setCommentType('internal')}
                          >
                            <span className="w-2 h-2 inline-block bg-yellow-400 rounded-full mr-1"></span>
                            Internal
                          </button>
                          <button 
                            className={`px-2 py-1 text-xs font-medium rounded-md ${
                              commentType === 'external' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            onClick={() => setCommentType('external')}
                          >
                            <span className="w-2 h-2 inline-block bg-blue-400 rounded-full mr-1"></span>
                            External
                          </button>
                        </div>
                      </div>
                      {!selectedText && !isAddingComment && (
                        <div className="text-xs text-gray-500 mb-2 flex items-center">
                          <AlertCircle className="h-3 w-3 text-gray-400 mr-1" />
                          Select text in the document to add a comment
                        </div>
                      )}
                      <textarea
                        className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                        rows={3}
                        placeholder="Add your comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={!selectedText && !isAddingComment}
                      ></textarea>
                      <div className="mt-2 flex justify-end">
                        <button
                          className={`flex items-center px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-all duration-200 ${
                            (!selectedText && !isAddingComment) || !newComment.trim() ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={handleSubmitComment}
                          disabled={(!selectedText && !isAddingComment) || !newComment.trim()}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Submit Comment
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Actions</h4>
                    <div className="mt-2 space-y-2">
                      <button className="w-full flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        <Download className="h-3 w-3 mr-1" />
                        Download Document
                      </button>
                      <button className="w-full flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        <Share2 className="h-3 w-3 mr-1" />
                        Share Document
                      </button>
                      <button className="w-full flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        View All Comments
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;