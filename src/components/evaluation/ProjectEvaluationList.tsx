import React from 'react';
import { BarChart2, Calendar, Users, ChevronRight, Star } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'draft';
  progress: number;
  dueDate: string;
  vendors: number;
  categories: number;
  averageScore?: number;
  lastModified: string;
}

const projects: Project[] = [
  {
    id: 'p1',
    name: 'Software Development Project 2025',
    description: 'Evaluation of potential software development partners',
    status: 'active',
    progress: 75,
    dueDate: '2025-06-30',
    vendors: 4,
    categories: 6,
    averageScore: 87.5,
    lastModified: '2025-03-20'
  },
  {
    id: 'p2',
    name: 'Cloud Infrastructure Migration',
    description: 'Assessment of cloud service providers',
    status: 'draft',
    progress: 30,
    dueDate: '2025-08-15',
    vendors: 3,
    categories: 5,
    lastModified: '2025-03-18'
  },
  {
    id: 'p3',
    name: 'Data Center Consolidation',
    description: 'Evaluation of data center service providers',
    status: 'completed',
    progress: 100,
    dueDate: '2025-03-15',
    vendors: 5,
    categories: 4,
    averageScore: 92.3,
    lastModified: '2025-03-15'
  }
];

const ProjectEvaluationList: React.FC = () => {
  return (
    <div className="space-y-6">
      {projects.map(project => (
        <div 
          key={project.id}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{project.description}</p>
              </div>
              <a 
                href={`#evaluation/project/${project.id}`}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center"
              >
                View Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                Due: {new Date(project.dueDate).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                {project.vendors} vendors
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Star className="h-4 w-4 mr-2 text-gray-400" />
                {project.categories} categories
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <BarChart2 className="h-4 w-4 mr-2 text-gray-400" />
                {project.averageScore ? `${project.averageScore}% avg. score` : 'Not scored'}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    project.status === 'completed' ? 'bg-green-500' :
                    project.progress >= 60 ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Last modified: {new Date(project.lastModified).toLocaleDateString()}
              </span>
              <div className="flex space-x-3">
                <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Export Results
                </button>
                <button className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700">
                  Continue Evaluation
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectEvaluationList;