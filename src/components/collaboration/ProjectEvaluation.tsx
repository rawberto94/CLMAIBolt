import React, { useState } from 'react';
import { Plus, Download, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import NewEvaluationModal from '../suppliers/evaluation/NewEvaluationModal';
import ProjectEvaluationMatrix from '../suppliers/evaluation/ProjectEvaluationMatrix';

interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'draft';
  lastModified: string;
  progress: number;
  score?: number;
  evaluators: number;
}

const ProjectEvaluation: React.FC = () => {
  const [showNewEvaluationModal, setShowNewEvaluationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [sortField, setSortField] = useState<'date' | 'progress' | 'score'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterOpen, setFilterOpen] = useState(false);

  // Sample project data
  const projects: Project[] = [
    {
      id: 'p1',
      name: 'Software Development Project 2025',
      status: 'active',
      lastModified: '2025-03-20',
      progress: 75,
      score: 87.5,
      evaluators: 5
    },
    {
      id: 'p2',
      name: 'Cloud Infrastructure Migration',
      status: 'draft',
      lastModified: '2025-03-18',
      progress: 30,
      evaluators: 3
    },
    {
      id: 'p3',
      name: 'Data Center Consolidation',
      status: 'completed',
      lastModified: '2025-03-15',
      progress: 100,
      score: 92.3,
      evaluators: 7
    }
  ];

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    averageScore: projects.reduce((acc, p) => acc + (p.score || 0), 0) / 
      projects.filter(p => p.score !== undefined).length,
    totalEvaluators: projects.reduce((acc, p) => acc + p.evaluators, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Evaluation Dashboard</h2>
          <p className="text-gray-600">Track and manage project performance evaluations</p>
        </div>
        <div className="mt-4 sm:mt-0 space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
          <button
            onClick={() => setShowNewEvaluationModal(true)}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project Evaluation
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <Download className="h-4 w-4 mr-2" />
            Export Results
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
              placeholder="Search projects..."
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <select
              className="block w-64 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>

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
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Sort By</h3>
                    <div className="space-y-2">
                      <button
                        className={`flex items-center justify-between w-full px-2 py-1 text-sm rounded-md ${
                          sortField === 'date' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSortField('date');
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        <span>Date</span>
                        {sortField === 'date' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        className={`flex items-center justify-between w-full px-2 py-1 text-sm rounded-md ${
                          sortField === 'progress' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSortField('progress');
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        <span>Progress</span>
                        {sortField === 'progress' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        className={`flex items-center justify-between w-full px-2 py-1 text-sm rounded-md ${
                          sortField === 'score' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSortField('score');
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        <span>Score</span>
                        {sortField === 'score' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <h3 className="text-sm font-medium text-gray-900 mt-4 mb-2">Status</h3>
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Project Status</h3>
            <span className="text-2xl font-bold text-primary-600">{stats.totalProjects}</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Active</span>
              <span className="font-medium text-gray-900">{stats.activeProjects} projects</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(stats.activeProjects / stats.totalProjects) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Completed</span>
              <span className="font-medium text-gray-900">{stats.completedProjects} projects</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(stats.completedProjects / stats.totalProjects) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Average Score</h3>
            <span className="text-2xl font-bold text-primary-600">{stats.averageScore.toFixed(1)}%</span>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  stats.averageScore >= 90
                    ? 'bg-green-500'
                    : stats.averageScore >= 70
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${stats.averageScore}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Based on completed project evaluations
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Evaluation Team</h3>
            <span className="text-2xl font-bold text-primary-600">{stats.totalEvaluators}</span>
          </div>
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-900">Total Evaluators</div>
            <div className="mt-2 text-sm text-gray-500">Across all projects</div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900">{(stats.totalEvaluators / stats.totalProjects).toFixed(1)}</div>
                <div className="text-xs text-gray-500">Avg. per Project</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900">{Math.max(...projects.map(p => p.evaluators))}</div>
                <div className="text-xs text-gray-500">Max. per Project</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Project Evaluation Matrix</h3>
          <p className="text-sm text-gray-500 mt-1">Detailed evaluation criteria and scoring</p>
        </div>
        <ProjectEvaluationMatrix />
      </div>

      {showNewEvaluationModal && (
        <NewEvaluationModal
          onClose={() => setShowNewEvaluationModal(false)}
          onSave={(data) => {
            console.log('New project evaluation:', data);
            setShowNewEvaluationModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ProjectEvaluation;