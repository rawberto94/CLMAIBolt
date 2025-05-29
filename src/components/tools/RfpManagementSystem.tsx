import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  CheckCircle, 
  Clock, 
  Users, 
  Settings, 
  AlertTriangle, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart2, 
  MessageSquare,
  RefreshCw,
  X,
  Calendar,
  ArrowRight,
  Mail
} from 'lucide-react';
import RfpDraftAssistant from './rfp/RfpDraftAssistant';
import RfpClauseAnalyzer from './rfp/RfpClauseAnalyzer';
import RfpSubmissionPortal from './rfp/RfpSubmissionPortal';
import RfpEvaluationMatrix from './rfp/RfpEvaluationMatrix';
import RfpDashboard from './rfp/RfpDashboard';

interface RfpManagementSystemProps {
  projectId?: string;
}

const RfpManagementSystem: React.FC<RfpManagementSystemProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'draft' | 'analyze' | 'submissions' | 'evaluate'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedRfp, setSelectedRfp] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showNewRfpModal, setShowNewRfpModal] = useState(false);

  // If projectId is provided, we're in a specific project view
  React.useEffect(() => {
    if (projectId) {
      setSelectedRfp(projectId);
      setActiveTab('dashboard');
    }
  }, [projectId]);

  const handleCreateNewRfp = () => {
    setShowNewRfpModal(true);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <RfpDashboard selectedRfp={selectedRfp} onSelectRfp={setSelectedRfp} />;
      case 'draft':
        return <RfpDraftAssistant selectedRfp={selectedRfp} />;
      case 'analyze':
        return <RfpClauseAnalyzer selectedRfp={selectedRfp} />;
      case 'submissions':
        return <RfpSubmissionPortal selectedRfp={selectedRfp} />;
      case 'evaluate':
        return <RfpEvaluationMatrix selectedRfp={selectedRfp} />;
      default:
        return <RfpDashboard selectedRfp={selectedRfp} onSelectRfp={setSelectedRfp} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="relative">
          <h2 className="text-3xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">RFP Management System</h2>
          <p className="text-gray-600 mt-1">AI-powered platform for drafting, reviewing, and evaluating RFPs</p>
          <div className="absolute -z-10 w-20 h-20 rounded-full bg-primary-100 blur-xl opacity-60 -top-10 -left-5"></div>
        </div>
        <div className="mt-4 sm:mt-0 space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
          <button
            onClick={handleCreateNewRfp}
            className="group relative flex items-center justify-center px-6 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
            New RFP
            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <button
            className={`flex-1 py-4 px-4 text-center text-sm font-medium relative transition-all duration-300 ${
              activeTab === 'dashboard'
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-primary-500'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart2 className={`h-5 w-5 mr-2 inline transition-transform duration-300 ${activeTab === 'dashboard' ? 'text-primary-500 scale-110' : 'text-gray-400'}`} />
            Dashboard
            {activeTab === 'dashboard' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"></span>
            )}
          </button>
          <button
            className={`flex-1 py-4 px-4 text-center text-sm font-medium relative transition-all duration-300 ${
              activeTab === 'draft'
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-primary-500'
            }`}
            onClick={() => setActiveTab('draft')}
          >
            <FileText className={`h-5 w-5 mr-2 inline transition-transform duration-300 ${activeTab === 'draft' ? 'text-primary-500 scale-110' : 'text-gray-400'}`} />
            Draft Assistant
            {activeTab === 'draft' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"></span>
            )}
          </button>
          <button
            className={`flex-1 py-4 px-4 text-center text-sm font-medium relative transition-all duration-300 ${
              activeTab === 'analyze'
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-primary-500'
            }`}
            onClick={() => setActiveTab('analyze')}
          >
            <Zap className={`h-5 w-5 mr-2 inline transition-transform duration-300 ${activeTab === 'analyze' ? 'text-primary-500 scale-110' : 'text-gray-400'}`} />
            Clause Analyzer
            {activeTab === 'analyze' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"></span>
            )}
          </button>
          <button
            className={`flex-1 py-4 px-4 text-center text-sm font-medium relative transition-all duration-300 ${
              activeTab === 'submissions'
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-primary-500'
            }`}
            onClick={() => setActiveTab('submissions')}
          >
            <Upload className={`h-5 w-5 mr-2 inline transition-transform duration-300 ${activeTab === 'submissions' ? 'text-primary-500 scale-110' : 'text-gray-400'}`} />
            Submissions
            {activeTab === 'submissions' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"></span>
            )}
          </button>
          <button
            className={`flex-1 py-4 px-4 text-center text-sm font-medium relative transition-all duration-300 ${
              activeTab === 'evaluate'
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-primary-500'
            }`}
            onClick={() => setActiveTab('evaluate')}
          >
            <CheckCircle className={`h-5 w-5 mr-2 inline transition-transform duration-300 ${activeTab === 'evaluate' ? 'text-primary-500 scale-110' : 'text-gray-400'}`} />
            Evaluation
            {activeTab === 'evaluate' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"></span>
            )}
          </button>
        </div>

        <div className="p-4 flex flex-col md:flex-row gap-4 bg-white">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search RFPs..."
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-primary-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <button
                className="w-full md:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {(selectedStatuses.length > 0 || selectedCategories.length > 0 || dateRange.start || dateRange.end) && (
                  <span className="ml-1 bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full">
                    {selectedStatuses.length + selectedCategories.length + (dateRange.start ? 1 : 0) + (dateRange.end ? 1 : 0)}
                  </span>
                )}
              </button>

              {filterOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-lg shadow-xl bg-white border border-gray-100 z-10 overflow-hidden">
                  <div className="py-1 p-3" role="menu">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Status</h3>
                    <div className="space-y-2">
                      {['Draft', 'Published', 'Closed', 'Awarded'].map((status) => (
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
                          <span className="ml-2 text-sm text-gray-700">{status}</span>
                        </label>
                      ))}
                    </div>

                    <h3 className="text-sm font-medium text-gray-900 mt-4 mb-2">Category</h3>
                    <div className="space-y-2">
                      {['IT Services', 'Consulting', 'Software', 'Hardware', 'Professional Services'].map((category) => (
                        <label key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={selectedCategories.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, category]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(c => c !== category));
                              }
                            }}
                          />
                          <span className="ml-2 text-sm text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>

                    <h3 className="text-sm font-medium text-gray-900 mt-4 mb-2">Date Range</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                        <input
                          type="date"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
                        <input
                          type="date"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between">
                      <button 
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        onClick={() => {
                          setSelectedStatuses([]);
                          setSelectedCategories([]);
                          setDateRange({ start: '', end: '' });
                        }}
                      >
                        Clear All
                      </button>
                      <button
                        className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors duration-200"
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
      </div>

      {renderActiveTab()}

      {showNewRfpModal && (
        <NewRfpModal onClose={() => setShowNewRfpModal(false)} />
      )}
    </div>
  );
};

interface NewRfpModalProps {
  onClose: () => void;
}

const NewRfpModal: React.FC<NewRfpModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    budget: '',
    dueDate: '',
    startDate: '',
    endDate: '',
    department: '',
    contactPerson: '',
    contactEmail: '',
    tags: [] as string[],
    newTag: ''
  });
  const [step, setStep] = useState<'basic' | 'details' | 'template'>('basic');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success - close modal and redirect to draft assistant
      onClose();
      window.location.hash = '#tools/rfp/draft';
    } catch (error) {
      console.error('Error creating RFP:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formData.newTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(formData.newTag.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, prev.newTag.trim()],
          newTag: ''
        }));
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const templates = [
    { id: 'it-services', name: 'IT Services RFP', description: 'Template for IT services procurement including development, maintenance, and support.' },
    { id: 'software', name: 'Software Procurement', description: 'Template for software licenses, SaaS solutions, and related services.' },
    { id: 'consulting', name: 'Consulting Services', description: 'Template for professional consulting services across various domains.' },
    { id: 'hardware', name: 'Hardware & Equipment', description: 'Template for hardware, equipment, and physical asset procurement.' },
    { id: 'custom', name: 'Custom Template', description: 'Start from scratch with a blank template.' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 pt-[7.5rem] px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto transform transition-all duration-300 opacity-100 scale-100 mb-8 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4 text-primary-600" />
            </div>
            Create New RFP
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 'basic' && (
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RFP Title*
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-primary-300"
                  placeholder="Enter a descriptive title for your RFP"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category*
                </label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-primary-300"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="IT Services">IT Services</option>
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Professional Services">Professional Services</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brief Description*
                </label>
                <textarea
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-primary-300"
                  rows={3}
                  placeholder="Briefly describe the purpose and scope of this RFP"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Budget
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-primary-300"
                    placeholder="e.g., $50,000 - $75,000"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Due Date*
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-primary-300"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project End Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., IT, Finance, Operations"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Name of primary contact"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Email address"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
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
                  value={formData.newTag}
                  onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                  onKeyDown={handleTagAdd}
                />
              </div>
            </div>
          )}

          {step === 'template' && (
            <div className="p-8 space-y-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                  <FileText className="h-3 w-3 text-primary-600" />
                </div>
                Select a Template
              </h3>
              <p className="text-sm text-gray-500">
                Choose a template to jumpstart your RFP creation process. Our AI will use this as a starting point.
              </p>
              
              <div className="grid grid-cols-1 gap-4 mt-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedTemplate === template.id
                        ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-white'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 transform hover:-translate-y-1'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          selectedTemplate === template.id
                            ? 'bg-primary-100 text-primary-600 ring-4 ring-primary-50'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          <FileText className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="text-base font-medium text-gray-900">{template.name}</h4>
                        <p className="text-xs text-gray-500">{template.description}</p>
                      </div>
                      {selectedTemplate === template.id && (
                        <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between p-6 border-t border-gray-200 bg-gray-50">
            {step !== 'basic' && (
              <button
                type="button"
                onClick={() => setStep(step === 'details' ? 'basic' : 'details')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              >
                Back
              </button>
            )}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              >
                Cancel
              </button>
              {step === 'template' ? (
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedTemplate}
                  className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 border border-transparent rounded-lg hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 flex items-center transition-all duration-200 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create RFP
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(step === 'basic' ? 'details' : 'template')}
                  className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 border border-transparent rounded-lg hover:from-primary-700 hover:to-primary-600 transition-all duration-200 shadow-sm"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4 inline" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RfpManagementSystem;