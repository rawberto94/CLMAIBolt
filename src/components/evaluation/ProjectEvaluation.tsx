import React, { useState } from 'react';
import { Plus, Download, Search, Filter, Award, AlertCircle, Save, RefreshCw } from 'lucide-react';
import EvaluationList from './EvaluationList';
import ProjectEvaluationMatrix from '../suppliers/evaluation/ProjectEvaluationMatrix';
import NewEvaluationModal from '../suppliers/evaluation/NewEvaluationModal';
import { useLocation } from '../../contexts/LocationContext';

interface ProjectEvaluationProps {
  projectId?: string;
  vendorId?: string;
}

const ProjectEvaluation: React.FC<ProjectEvaluationProps> = ({ projectId, vendorId }) => {
  const [showNewEvaluationModal, setShowNewEvaluationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { currentLocation } = useLocation();
  const [currentView, setCurrentView] = useState<'list' | 'matrix'>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [evaluationStats, setEvaluationStats] = useState({
    totalEvaluations: 24,
    activeEvaluations: 12,
    completedEvaluations: 8,
    averageScore: 85,
    topPerformers: 5,
    pendingResponses: 4
  });
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState({
    completed: 65,
    remaining: 35,
    nextDeadline: '2024-04-15'
  });
  const [comparisonMetrics, setComparisonMetrics] = useState([
    { name: 'Technical Capability', weight: 0.3, avgScore: 82 },
    { name: 'Cost Effectiveness', weight: 0.25, avgScore: 78 },
    { name: 'Project Experience', weight: 0.25, avgScore: 88 },
    { name: 'Support & Maintenance', weight: 0.2, avgScore: 85 }
  ]);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [showScoringGuide, setShowScoringGuide] = useState(false);

  // If vendorId is provided, we're in vendor view mode
  const isVendorView = !!vendorId;

  // Set view based on whether projectId is provided
  React.useEffect(() => {
    if (projectId) {
      setCurrentView('matrix');
      setSelectedProjectId(projectId);
    } else {
      setCurrentView('list');
      setSelectedProjectId(null);
    }
  }, [projectId]);

  // Initialize default values for the EvaluationList props
  const defaultProps = {
    searchQuery: '',
    selectedProject: '',
    dateRange: { start: '', end: '' },
    selectedCategories: []
  };

  const handleFilterChange = () => {
    // Apply filters to the evaluation list
    const filteredProps = {
      searchQuery,
      selectedProject: '',
      dateRange,
      selectedCategories,
      selectedStatuses,
      sortField,
      sortDirection
    };
    
    // Update the evaluation list with filtered results
    setFilteredResults(filteredProps);
  };

  const handleExport = () => {
    // Handle the export based on the selected format
    if (exportFormat === 'pdf') {
      console.log('Exporting as PDF...');
      // Add PDF export logic here
    } else {
      console.log('Exporting as Excel...');
      // Add Excel export logic here
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsDirty(false);
      // Show success message or notification here
    } catch (error) {
      console.error('Error saving evaluation:', error);
      // Show error message
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900">Project Evaluation</h2>
          <p className="text-gray-600">
            {isVendorView 
              ? 'Provide your responses to project evaluation criteria'
              : 'Compare and score vendors based on project requirements'
            }
          </p>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Total Evaluations</div>
              <div className="mt-1 text-2xl font-bold text-gray-900">{evaluationStats.totalEvaluations}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Active</div>
              <div className="mt-1 text-2xl font-bold text-primary-600">{evaluationStats.activeEvaluations}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Avg Score</div>
              <div className="mt-1 text-2xl font-bold text-green-600">{evaluationStats.averageScore}%</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Pending</div>
              <div className="mt-1 text-2xl font-bold text-yellow-600">{evaluationStats.pendingResponses}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Progress</h3>
            <span className="text-sm text-gray-500">Next Deadline: {evaluationProgress.nextDeadline}</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completed Evaluations</span>
                <span className="font-medium">{evaluationProgress.completed}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${evaluationProgress.completed}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Remaining</span>
                <span className="font-medium">{evaluationProgress.remaining}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${evaluationProgress.remaining}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        {!isVendorView && <div className="mt-4 sm:mt-0 space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
          <button
            onClick={() => setShowNewEvaluationModal(true)}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Evaluation
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </button>
        </div>}
      </div>
      
      {currentView === 'matrix' && selectedProjectId ? (
        <>
          <div className="mb-4">
            <button
              onClick={() => {
                window.location.hash = 'evaluation';
              }}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              ← Back to Evaluations
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Evaluation Matrix</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowScoringGuide(true)}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Scoring Guide
                  </button>
                  <div className="flex items-center text-sm text-gray-500">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Minimum required score: 85%
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center ${
                      isDirty && !isSaving
                        ? 'bg-primary-600 hover:bg-primary-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel')}
                    className="mr-2 rounded-md border-gray-300"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                  </select>
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </button>
                </div>
              </div>
            </div>
            <ProjectEvaluationMatrix 
              onScoreChange={() => setIsDirty(true)}
              showScoringGuide={showScoringGuide}
              onCloseScoringGuide={() => setShowScoringGuide(false)}
            />
          </div>
        </>
      ) : (
        <EvaluationList {...defaultProps} />
      )}

      {showNewEvaluationModal && (
        <NewEvaluationModal
          onClose={() => setShowNewEvaluationModal(false)}
          onSave={(data) => {
            console.log('Saving evaluation:', data);
            setShowNewEvaluationModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ProjectEvaluation;