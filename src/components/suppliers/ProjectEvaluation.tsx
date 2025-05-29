import React, { useState } from 'react';
import { Plus, Download, Search, Filter } from 'lucide-react';
import ProjectEvaluationList from './evaluation/ProjectEvaluationList';
import ProjectEvaluationMatrix from './evaluation/ProjectEvaluationMatrix';
import NewEvaluationModal from './evaluation/NewEvaluationModal';

const ProjectEvaluation: React.FC = () => {
  const [showNewEvaluationModal, setShowNewEvaluationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'matrix'>('list');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Evaluation Matrix</h2>
          <p className="text-gray-600">Compare and score vendors based on project requirements</p>
        </div>
        <div className="mt-4 sm:mt-0 space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
          <button
            onClick={() => setShowNewEvaluationModal(true)}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Evaluation
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <Download className="h-4 w-4 mr-2" />
            Export Template
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search evaluations..."
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <button
                className="w-full md:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>

              {filterOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1 p-3" role="menu">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Status</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                        <span className="ml-2 text-sm text-gray-700">Completed</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                        <span className="ml-2 text-sm text-gray-700">Draft</span>
                      </label>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-primary-600 hover:text-primary-900"
                        onClick={() => setFilterOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="ml-4 px-3 py-1 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                        onClick={() => setFilterOpen(false)}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                  activeView === 'matrix'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                onClick={() => setActiveView('matrix')}
              >
                Matrix
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeView === 'list' ? (
        <ProjectEvaluationList />
      ) : (
        <ProjectEvaluationMatrix />
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