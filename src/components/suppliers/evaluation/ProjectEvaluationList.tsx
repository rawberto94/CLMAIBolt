import React from 'react';
import { BarChart2, Calendar, Users } from 'lucide-react';

interface Evaluation {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed';
  lastModified: string;
  vendors: number;
  categories: number;
}

const evaluations: Evaluation[] = [
  {
    id: 'eval1',
    name: 'Software Vendor Selection 2025',
    description: 'Evaluation for new contract management system',
    status: 'in_progress',
    lastModified: '2025-03-15',
    vendors: 4,
    categories: 6,
  },
  {
    id: 'eval2',
    name: 'Legal Services Provider Evaluation',
    description: 'Assessment of potential legal service providers',
    status: 'completed',
    lastModified: '2025-03-10',
    vendors: 3,
    categories: 5,
  },
  {
    id: 'eval3',
    name: 'Document Management System',
    description: 'Vendor selection for DMS implementation',
    status: 'draft',
    lastModified: '2025-03-01',
    vendors: 5,
    categories: 4,
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'in_progress':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          In Progress
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Completed
        </span>
      );
    case 'draft':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Draft
        </span>
      );
    default:
      return null;
  }
};

const ProjectEvaluationList: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {evaluations.map((evaluation) => (
        <div
          key={evaluation.id}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">{evaluation.name}</h3>
                  <div className="ml-3">{getStatusBadge(evaluation.status)}</div>
                </div>
                <p className="mt-1 text-sm text-gray-500">{evaluation.description}</p>
              </div>
              <div className="ml-4">
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  View Details
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                Last modified {evaluation.lastModified}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                {evaluation.vendors} vendors
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <BarChart2 className="h-4 w-4 mr-2 text-gray-400" />
                {evaluation.categories} categories
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Continue Evaluation
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Export Results
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectEvaluationList;