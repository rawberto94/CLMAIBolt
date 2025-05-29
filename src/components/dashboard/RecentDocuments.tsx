import React from 'react';
import { Download, Eye, AlertTriangle } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  type: string;
  date: string;
  status: 'approved' | 'pending' | 'flagged';
  owner: string;
}

const documents: Document[] = [
  {
    id: 'doc1',
    title: 'Master Service Agreement - Acme Corp',
    type: 'Contract',
    date: '2025-03-15',
    status: 'approved',
    owner: 'Jane Smith',
  },
  {
    id: 'doc2',
    title: 'Non-Disclosure Agreement - XYZ Inc.',
    type: 'NDA',
    date: '2025-03-12',
    status: 'pending',
    owner: 'John Davis',
  },
  {
    id: 'doc3',
    title: 'GDPR Compliance Report - Q1 2025',
    type: 'Report',
    date: '2025-03-10',
    status: 'flagged',
    owner: 'Alex Johnson',
  },
  {
    id: 'doc4',
    title: 'Employment Contract Template',
    type: 'Template',
    date: '2025-03-08',
    status: 'approved',
    owner: 'Robert Wilson',
  },
  {
    id: 'doc5',
    title: 'Software License Agreement - Tech Systems',
    type: 'Contract',
    date: '2025-03-05',
    status: 'approved',
    owner: 'Sarah Zhang',
  },
];

const RecentDocuments: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Document
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Type
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Owner
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{doc.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{doc.type}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{doc.date}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    doc.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : doc.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  {doc.status === 'flagged' && <AlertTriangle className="h-3 w-3 ml-1" />}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.owner}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex space-x-2">
                  <button className="text-primary-600 hover:text-primary-900" title="View">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-primary-600 hover:text-primary-900" title="Download">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentDocuments;