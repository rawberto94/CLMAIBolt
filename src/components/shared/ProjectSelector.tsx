import React, { useState } from 'react';
import { X, Search, Briefcase } from 'lucide-react';

interface ProjectSelectorProps {
  onClose: () => void;
  onSelect: (projectId: string) => void;
  selectedProject: string;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  onClose,
  onSelect,
  selectedProject
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock project data - replace with actual project data
  const projects = [
    { id: 'proj1', name: 'Digital Transformation 2025', status: 'active' },
    { id: 'proj2', name: 'IT Infrastructure Upgrade', status: 'active' },
    { id: 'proj3', name: 'Vendor Consolidation', status: 'on-hold' },
    { id: 'proj4', name: 'Compliance Initiative', status: 'active' },
    { id: 'proj5', name: 'Cost Optimization', status: 'completed' },
  ];

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-floating w-full max-w-md mx-4 border border-gray-100">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-semibold text-gray-900 font-heading">Select Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2.5 transition-all duration-200 hover:border-primary-300"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {filteredProjects.map(project => (
              <button
                key={project.id}
                className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 ${
                  selectedProject === project.id
                    ? 'bg-primary-50 border-primary-200 shadow-sm'
                    : 'hover:bg-gray-50 border-transparent hover:border-primary-200'
                } border hover:shadow-sm`}
                onClick={() => onSelect(project.id)}
              >
                <div className="flex-shrink-0">
                  <Briefcase className={`h-6 w-6 ${
                    selectedProject === project.id ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                </div>
                <div className="ml-4 flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900">{project.name}</div>
                  <div className="text-xs text-gray-500">ID: {project.id}</div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </div>
              </button>
            ))}
            {filteredProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                No projects found matching your search
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-5 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-subtle hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedProject) {
                  onSelect(selectedProject);
                }
              }}
              disabled={!selectedProject}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg shadow-sm hover:bg-primary-700 disabled:opacity-50 transition-all duration-200"
            >
              Select Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSelector;