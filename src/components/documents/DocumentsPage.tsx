import { useState } from 'react';
import { Plus, Download, Search, Filter, FileText, Upload, BarChart2, Sparkles } from 'lucide-react';
import DocumentList from './DocumentList';
import ContractAnalyzer from './ContractAnalyzer';
import NewContractModal from './NewContractModal';
import ProjectSelector from '../shared/ProjectSelector';
import TaxonomyFilter from '../shared/TaxonomyFilter';
import { useLocation } from '../../contexts/LocationContext';

const DocumentsPage: React.FC = () => {
  const { currentLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedL1, setSelectedL1] = useState<string[]>([]);
  const [selectedL2, setSelectedL2] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'list' | 'analyzer'>('list');
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const handleNewContract = (data: any) => {
    console.log('New contract data:', data);
    // Handle contract creation here
    setShowNewContractModal(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contract Management</h1>
          <p className="text-gray-600">Manage and analyze your contracts and agreements</p>
        </div>
        <div className="mt-4 sm:mt-0 space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
          <button
            onClick={() => setShowNewContractModal(true)}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </button>
          <button
            onClick={() => setActiveView('analyzer')}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Contract Analysis
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Upload className="h-4 w-4 mr-2" />
            Import Contracts
          </button>
        </div>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search contracts..."
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowProjectSelector(true)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {selectedProject || 'Select Project'}
            </button>
            <TaxonomyFilter
              selectedL1={selectedL1}
              selectedL2={selectedL2}
              onL1Change={setSelectedL1}
              onL2Change={setSelectedL2}
            />
            <div className="flex rounded-md shadow-sm">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeView === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                onClick={() => setActiveView('list')}
              >
                List
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeView === 'analyzer'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                onClick={() => setActiveView('analyzer')}
              >
                Analyzer
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeView === 'analyzer' ? (
        <ContractAnalyzer />
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary-600" />
              Contract Library
            </h2>
          </div>
          <DocumentList
            searchQuery={searchQuery}
            selectedProject={selectedProject}
            selectedL1={selectedL1}
            selectedL2={selectedL2}
            selectedClients={selectedClients}
            selectedSuppliers={selectedSuppliers}
          />
        </div>
      )}

      {showProjectSelector && (
        <ProjectSelector
          onClose={() => setShowProjectSelector(false)}
          onSelect={(projectId) => {
            setSelectedProject(projectId);
            setShowProjectSelector(false);
          }}
          selectedProject={selectedProject}
        />
      )}
      
      {showNewContractModal && (
        <NewContractModal
          onClose={() => setShowNewContractModal(false)}
          onSave={handleNewContract}
        />
      )}
    </div>
  );
};

export default DocumentsPage;