import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  Download, 
  Upload, 
  Zap, 
  CheckCircle, 
  X, 
  RefreshCw, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Settings,
  Copy
} from 'lucide-react';

interface RfpDraftAssistantProps {
  selectedRfp: string | null;
}

interface RfpSection {
  id: string;
  title: string;
  content: string;
  isExpanded: boolean;
  isEditing: boolean;
  isGenerating: boolean;
}

const RfpDraftAssistant: React.FC<RfpDraftAssistantProps> = ({ selectedRfp }) => {
  const [rfpTitle, setRfpTitle] = useState('Enterprise Resource Planning (ERP) System Implementation');
  const [rfpSections, setRfpSections] = useState<RfpSection[]>([
    {
      id: 'section-1',
      title: 'Introduction and Background',
      content: 'Our organization is seeking proposals for the implementation of a new Enterprise Resource Planning (ERP) system to replace our legacy systems and integrate our finance, human resources, and operations departments. The current systems are outdated and operate in silos, creating inefficiencies and data inconsistencies across the organization.',
      isExpanded: true,
      isEditing: false,
      isGenerating: false
    },
    {
      id: 'section-2',
      title: 'Scope of Work',
      content: 'The selected vendor will be responsible for the full implementation of the ERP system, including but not limited to: system configuration, data migration, integration with existing systems, testing, training, and post-implementation support. The solution should address the needs of finance, human resources, procurement, and operations departments.',
      isExpanded: true,
      isEditing: false,
      isGenerating: false
    },
    {
      id: 'section-3',
      title: 'Requirements',
      content: 'The proposed ERP solution must include the following modules:\n\n1. Financial Management\n2. Human Resources Management\n3. Procurement and Vendor Management\n4. Inventory Management\n5. Project Management\n6. Reporting and Analytics\n\nThe system must be cloud-based, scalable, and provide robust security features. It should also offer mobile accessibility and integrate with our existing customer relationship management (CRM) system.',
      isExpanded: true,
      isEditing: false,
      isGenerating: false
    },
    {
      id: 'section-4',
      title: 'Timeline',
      content: 'The project timeline is as follows:\n\n- RFP Release Date: March 15, 2025\n- Questions Due: March 29, 2025\n- Proposal Due Date: April 15, 2025\n- Vendor Presentations: April 22-24, 2025\n- Vendor Selection: May 1, 2025\n- Project Kickoff: May 15, 2025\n- Target Go-Live Date: November 1, 2025',
      isExpanded: true,
      isEditing: false,
      isGenerating: false
    },
    {
      id: 'section-5',
      title: 'Evaluation Criteria',
      content: 'Proposals will be evaluated based on the following criteria:\n\n1. Functional Requirements (30%)\n2. Technical Requirements (20%)\n3. Implementation Approach (15%)\n4. Vendor Experience and References (15%)\n5. Cost (20%)\n\nVendors must meet all mandatory requirements to be considered.',
      isExpanded: true,
      isEditing: false,
      isGenerating: false
    }
  ]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSectionForAi, setSelectedSectionForAi] = useState<string | null>(null);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Adjust textarea height to fit content when editing
    if (editorRef.current) {
      editorRef.current.style.height = 'auto';
      editorRef.current.style.height = `${editorRef.current.scrollHeight}px`;
    }
  }, [rfpSections]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Success notification would go here
    } catch (error) {
      // Error handling would go here
      console.error('Error saving RFP:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    // Handle export functionality
    console.log('Exporting RFP...');
  };

  const toggleSectionExpand = (sectionId: string) => {
    setRfpSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isExpanded: !section.isExpanded } 
        : section
    ));
  };

  const toggleSectionEdit = (sectionId: string) => {
    setRfpSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isEditing: !section.isEditing } 
        : section
    ));
  };

  const updateSectionContent = (sectionId: string, content: string) => {
    setRfpSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, content } 
        : section
    ));
  };

  const handleGenerateWithAi = async () => {
    if (!aiPrompt || !selectedSectionForAi) return;
    
    setIsGenerating(true);
    
    try {
      // Simulate API call to OpenAI
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock generated content
      const generatedContent = `Based on your request, here's a draft for the ${
        rfpSections.find(s => s.id === selectedSectionForAi)?.title
      } section:\n\n${aiPrompt}\n\nThis content addresses the key points you requested and follows best practices for RFP documentation. Feel free to edit and refine this content to better match your specific requirements.`;
      
      // Update the section with generated content
      setRfpSections(prev => prev.map(section => 
        section.id === selectedSectionForAi 
          ? { ...section, content: generatedContent, isGenerating: false } 
          : section
      ));
      
      // Close the AI prompt modal
      setShowAiPrompt(false);
      setAiPrompt('');
      setSelectedSectionForAi(null);
    } catch (error) {
      console.error('Error generating content:', error);
      // Error handling would go here
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    
    const newSection: RfpSection = {
      id: `section-${Date.now()}`,
      title: newSectionTitle,
      content: '',
      isExpanded: true,
      isEditing: true,
      isGenerating: false
    };
    
    setRfpSections(prev => [...prev, newSection]);
    setShowAddSectionModal(false);
    setNewSectionTitle('');
  };

  const handleDeleteSection = (sectionId: string) => {
    setRfpSections(prev => prev.filter(section => section.id !== sectionId));
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sectionIndex = rfpSections.findIndex(section => section.id === sectionId);
    if (
      (direction === 'up' && sectionIndex === 0) || 
      (direction === 'down' && sectionIndex === rfpSections.length - 1)
    ) {
      return;
    }
    
    const newSections = [...rfpSections];
    const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
    [newSections[sectionIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[sectionIndex]];
    
    setRfpSections(newSections);
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;
    
    // In a real implementation, this would load the template content
    // For now, we'll just show a success message
    setShowTemplateLibrary(false);
    setSelectedTemplate(null);
  };

  // Template library data
  const templates = [
    { id: 'template-1', name: 'IT Services RFP', description: 'Standard template for IT services procurement' },
    { id: 'template-2', name: 'Software Procurement', description: 'Template for software and SaaS solutions' },
    { id: 'template-3', name: 'Hardware & Equipment', description: 'Template for hardware and physical assets' },
    { id: 'template-4', name: 'Consulting Services', description: 'Template for professional consulting services' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            RFP Draft Assistant
          </h2>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl">
            Create and edit your RFP with AI-powered assistance
          </p>
          <div className="absolute -z-10 w-20 h-20 rounded-full bg-blue-100 blur-xl opacity-40 -top-10 -left-5"></div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTemplateLibrary(true)}
            className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Template Library
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 transition-all duration-200 shadow-sm"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RFP Title
          </label>
          <input
            type="text"
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-lg font-medium transition-all duration-200 hover:border-primary-300"
            value={rfpTitle}
            onChange={(e) => setRfpTitle(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {rfpSections.map((section, index) => (
            <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-b">
                <button
                  className="flex items-center text-left flex-grow group"
                  onClick={() => toggleSectionExpand(section.id)}
                >
                  {section.isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 mr-2 group-hover:text-primary-500 transition-colors duration-200" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 mr-2 group-hover:text-primary-500 transition-colors duration-200" />
                  )}
                  <span className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-200">{section.title}</span>
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedSectionForAi(section.id);
                      setShowAiPrompt(true);
                    }}
                    className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-50 rounded-full transition-colors duration-200"
                    title="Generate with AI"
                  >
                    <Zap className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => toggleSectionEdit(section.id)}
                    className="text-primary-600 hover:text-primary-800 p-1 hover:bg-primary-50 rounded-full transition-colors duration-200"
                    title={section.isEditing ? "Save" : "Edit"}
                  >
                    {section.isEditing ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded-full transition-colors duration-200"
                    title="Delete Section"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {section.isExpanded && (
                <div className="p-4">
                  {section.isEditing ? (
                    <textarea 
                      ref={editorRef}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 min-h-[200px]"
                      value={section.content}
                      onChange={(e) => updateSectionContent(section.id, e.target.value)}
                    />
                  ) : (
                    <div className="prose max-w-none">
                      {section.content.split('\n').map((line, i) => ( 
                        <React.Fragment key={i}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                  
                  {!section.isEditing && (
                    <div className="mt-4 flex justify-end space-x-3">
                      {index > 0 && (
                        <button
                          onClick={() => handleMoveSection(section.id, 'up')}
                          className="text-gray-500 hover:text-gray-700"
                          title="Move Up"
                        >
                          <ChevronUp className="h-5 w-5" />
                        </button>
                      )}
                      {index < rfpSections.length - 1 && (
                        <button
                          onClick={() => handleMoveSection(section.id, 'down')}
                          className="text-gray-500 hover:text-gray-700"
                          title="Move Down"
                        >
                          <ChevronDown className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          <div className="flex justify-center">
            <button 
              onClick={() => setShowAddSectionModal(true)}
              className="flex items-center px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 group"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </button>
          </div>
        </div>
      </div>

      {showAiPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">AI Content Generator</h3>
              </div>
              <button
                onClick={() => {
                  setShowAiPrompt(false);
                  setAiPrompt('');
                  setSelectedSectionForAi(null);
                }} 
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Generating content for: <span className="font-semibold text-primary-600">{rfpSections.find(s => s.id === selectedSectionForAi)?.title}</span>
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Describe what you want to include in this section, and our AI will generate content for you.
                </p> 
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  rows={6}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., Generate a detailed scope of work section for an ERP implementation project, including system configuration, data migration, testing, and training requirements."
                />
              </div>
              <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">AI Prompt Suggestions</span>
                </div>
                <div className="mt-2 space-y-2">
                  <button
                    onClick={() => setAiPrompt("Generate a comprehensive requirements section for an ERP system implementation, including functional requirements for finance, HR, and operations modules.")}
                    className="text-sm text-left text-purple-600 hover:text-purple-800 block hover:underline transition-colors duration-200"
                  >
                    • Generate requirements for ERP system modules
                  </button>
                  <button
                    onClick={() => setAiPrompt("Create a detailed evaluation criteria section with scoring weights for technical capability, implementation approach, vendor experience, and cost.")}
                    className="text-sm text-left text-purple-600 hover:text-purple-800 block hover:underline transition-colors duration-200"
                  >
                    • Create evaluation criteria with scoring weights
                  </button>
                  <button
                    onClick={() => setAiPrompt("Draft a timeline section with key milestones for the RFP process, vendor selection, and implementation phases.")}
                    className="text-sm text-left text-purple-600 hover:text-purple-800 block hover:underline transition-colors duration-200"
                  >
                    • Draft project timeline with key milestones
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowAiPrompt(false);
                  setAiPrompt('');
                  setSelectedSectionForAi(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateWithAi} 
                disabled={isGenerating || !aiPrompt.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg font-medium text-gray-900">Add New Section</h3>
              <button
                onClick={() => {
                  setShowAddSectionModal(false);
                  setNewSectionTitle('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Title
                </label> 
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="e.g., Vendor Qualifications"
                />
              </div>
              <div className="mt-6 bg-gray-50 p-5 rounded-lg border border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Common RFP Sections</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Introduction', 'Background', 'Scope of Work', 'Requirements', 
                    'Timeline', 'Evaluation Criteria', 'Submission Instructions', 
                    'Terms and Conditions', 'Pricing', 'Vendor Qualifications'
                  ].map((section) => (
                    <button
                      key={section}
                      onClick={() => setNewSectionTitle(section)} 
                      className="text-sm text-left text-primary-600 hover:text-primary-800 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowAddSectionModal(false);
                  setNewSectionTitle('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddSection}
                disabled={!newSectionTitle.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}

      {showTemplateLibrary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg font-medium text-gray-900">Template Library</h3>
              <button
                onClick={() => {
                  setShowTemplateLibrary(false);
                  setSelectedTemplate(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-8">
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Select a template to use as a starting point for your RFP. This will replace your current content.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 mt-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedTemplate === template.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          selectedTemplate === template.id
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          <FileText className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                        <p className="text-xs text-gray-500">{template.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowTemplateLibrary(false);
                  setSelectedTemplate(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleApplyTemplate}
                disabled={!selectedTemplate}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Apply Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default RfpDraftAssistant