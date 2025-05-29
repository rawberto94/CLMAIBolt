import React from 'react';
import { ChevronRight } from 'lucide-react';

interface EvaluationListProps {
  searchQuery?: string;
  selectedProject?: string;
  dateRange?: { start: string; end: string };
  selectedCategories?: string[];
}

const EvaluationList: React.FC<EvaluationListProps> = ({ 
  searchQuery = '', 
  selectedProject = '',
  dateRange = { start: '', end: '' },
  selectedCategories = []
}) => {
  const evaluations = [
    {
      id: 1,
      title: 'Q4 Software Vendor Evaluation',
      status: 'active',
      progress: 75,
      vendors: 8,
      dueDate: '2024-12-31',
      owner: 'Sarah Chen'
    },
    {
      id: 2,
      title: 'Hardware Supplier Assessment',
      status: 'completed',
      progress: 100,
      vendors: 5,
      dueDate: '2024-11-15',
      owner: 'Michael Rodriguez'
    },
    // Add more sample evaluations as needed
  ];

  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = searchQuery ? evaluation.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const matchesProject = !selectedProject || evaluation.title.toLowerCase().includes(selectedProject.toLowerCase());
    const matchesStartDate = !dateRange.start || new Date(evaluation.dueDate) >= new Date(dateRange.start);
    const matchesEndDate = !dateRange.end || new Date(evaluation.dueDate) <= new Date(dateRange.end);

    return matchesSearch && matchesProject && matchesStartDate && matchesEndDate;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Evaluation
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vendors
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Owner
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredEvaluations.map((evaluation) => (
            <tr key={evaluation.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{evaluation.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  evaluation.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {evaluation.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ width: `${evaluation.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-1">{evaluation.progress}%</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {evaluation.vendors} vendors
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {evaluation.dueDate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {evaluation.owner}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <a 
                  href={`#tools/evaluation/project/${evaluation.id}`}
                  className="text-primary-600 hover:text-primary-900 inline-flex items-center group cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.hash = `tools/evaluation/project/${evaluation.id}`;
                  }}
                >
                  View
                  <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </a>
              </td>
            </tr>
          ))}
          {filteredEvaluations.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                No evaluations found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EvaluationList;