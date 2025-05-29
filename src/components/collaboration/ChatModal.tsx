import React, { useState } from 'react';
import { X, Upload, Paperclip, Send, AlertCircle, Users, Calendar, Tag, Briefcase, MessageSquare } from 'lucide-react';
import TaxonomyFilter from '../shared/TaxonomyFilter';

interface ChatModalProps {
  onClose: () => void;
}

interface Participant {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface Project {
  id: string;
  name: string;
  category: {
    l1: string;
    l2: string;
  };
  status: 'active' | 'completed' | 'on-hold';
}

const ChatModal: React.FC<ChatModalProps> = ({ onClose }) => {
  const [selectedContract, setSelectedContract] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [selectedL1, setSelectedL1] = useState<string>('');
  const [selectedL2, setSelectedL2] = useState<string[]>([]);
  const [selectedL1Categories, setSelectedL1Categories] = useState<string[]>([]);
  const [discussionTitle, setDiscussionTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [step, setStep] = useState<'project' | 'details'>('project');

  // Mock projects data
  const projects = [
    { 
      id: 'DT-2025-001', 
      name: 'Digital Transformation 2025', 
      status: 'active',
      category: { l1: 'IT', l2: 'Digital Transformation' }
    },
    { 
      id: 'IT-2025-002', 
      name: 'IT Infrastructure Upgrade', 
      status: 'active',
      category: { l1: 'IT', l2: 'Infrastructure' }
    },
    { 
      id: 'SC-2025-003', 
      name: 'Vendor Consolidation', 
      status: 'on-hold',
      category: { l1: 'Supply Chain', l2: 'Vendor Management' }
    },
    {
      id: 'FN-2025-004',
      name: 'Financial Systems Integration',
      status: 'active',
      category: { l1: 'Finance', l2: 'Systems' }
    }
  ];

  const participants: Participant[] = [
    {
      id: 'legal1',
      name: 'Sarah Zhang',
      role: 'Legal Counsel',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120'
    },
    {
      id: 'legal2',
      name: 'Robert Wilson',
      role: 'Legal Admin',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=120'
    },
    {
      id: 'compliance1',
      name: 'Mike Johnson',
      role: 'Compliance Officer',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=120'
    }
  ];

  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(projectSearchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log({
      project: selectedProject,
      contract: selectedContract,
      title: discussionTitle,
      category: {
        l1: selectedL1Categories,
        l2: selectedL2
      },
      initialMessage: message,
      participants: selectedParticipants,
      attachments,
      priority,
      dueDate,
      tags
    });
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      window.location.hash = '#collaboration';
    }, 1000);
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-100 text-red-800 ring-red-600';
      case 'medium': return 'bg-yellow-100 text-yellow-800 ring-yellow-600';
      case 'low': return 'bg-green-100 text-green-800 ring-green-600';
      default: return '';
    }
  };

  const renderProjectSelection = () => (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <MessageSquare className="h-12 w-12 text-primary-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Select Project</h3>
        <p className="text-sm text-gray-500 mt-1">Choose the project for this discussion</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No projects found matching your criteria
          </div>
        ) : (
          projects.map(project => (
            <button
              key={project.id}
              onClick={() => {
                setSelectedProject(project.id);
                setStep('details');
              }}
              className={`flex items-center p-4 border-2 rounded-lg transition-all ${
                selectedProject === project.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <Briefcase className={`h-5 w-5 ${
                selectedProject === project.id ? 'text-primary-600' : 'text-gray-400'
              }`} />
              <div className="ml-3 flex-1 text-left">
                <div>
                  <div className="font-medium text-gray-900">{project.name}</div>
                  <div className="text-sm text-gray-500">ID: {project.id}</div>
                </div>
                <div className="mt-1 flex gap-2">
                  <span className="text-xs text-gray-500">{project.category.l1} / {project.category.l2}</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                project.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : project.status === 'on-hold'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-[7.5rem] px-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto transform transition-all duration-300 opacity-100 scale-100 mb-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Start New Discussion</h2>
            {step === 'details' && selectedProject && (
              <p className="text-sm text-gray-500 mt-1">
                Project: {projects.find(p => p.id === selectedProject)?.name}
              </p>
            )}
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {step === 'project' ? (
          renderProjectSelection()
        ) : (
          <div className="p-6 space-y-6">
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discussion Title
              </label>
              <input
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 mb-4"
                placeholder="Enter discussion title"
                value={discussionTitle}
                onChange={(e) => setDiscussionTitle(e.target.value)}
                required
              />
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <TaxonomyFilter
                    selectedL1={selectedL1Categories}
                    selectedL2={selectedL2}
                    onL1Change={setSelectedL1Categories}
                    onL2Change={setSelectedL2}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 mt-4">
                <div className="flex-1">
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
                
                <div className="flex-1">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discussion Details
              </label>
              <textarea
                className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                rows={4}
                placeholder="Describe the purpose of this discussion and any specific points you'd like to address..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add tags (press Enter to add)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagAdd}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participants
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {participants.map((participant) => (
                  <label
                    key={participant.id}
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={selectedParticipants.includes(participant.id)}
                      onChange={(e) => {
                        setSelectedParticipants(prev =>
                          e.target.checked
                            ? [...prev, participant.id]
                            : prev.filter(p => p !== participant.id)
                        );
                      }}
                    />
                    <div className="ml-3 flex items-center">
                      <img
                        src={participant.avatar}
                        alt={participant.name}
                        className="h-8 w-8 rounded-full"
                      />
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                        <div className="text-xs text-gray-500">{participant.role}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
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
                      <Paperclip className="h-4 w-4 mr-2" />
                      {file.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          {step === 'project' ? (
            <button
              type="button"
              onClick={() => setStep('details')}
              disabled={!selectedProject}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
            >
              Continue
            </button>
          ) : (
          <button
            type="submit"
            disabled={isSubmitting || !selectedContract || !discussionTitle || !message || selectedParticipants.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Creating...' : 'Start Discussion'}
          </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatModal;