import React, { useState } from 'react';
import { Mail, MoreVertical, Edit, Trash2, Shield } from 'lucide-react';
import { Collaborator } from '../../types/Collaborator';

interface CollaboratorsListProps {
  searchQuery: string;
  selectedL1?: string[];
  selectedL2?: string[];
}

const collaborators: Collaborator[] = [
  {
    id: 'user1',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=120',
    role: 'Legal Admin',
    department: 'Legal Services',
    category: {
      l1: 'Professional Services',
      l2: 'Legal Services'
    },
    status: 'active',
    lastActive: '2025-03-20T14:30:00',
  },
  {
    id: 'user2',
    name: 'Robert Wilson',
    email: 'robert.wilson@example.com',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=120',
    role: 'Legal Counsel',
    department: 'Legal Services',
    category: {
      l1: 'Professional Services',
      l2: 'Legal Services'
    },
    status: 'active',
    lastActive: '2025-03-20T12:15:00',
  },
  {
    id: 'user3',
    name: 'Sarah Zhang',
    email: 'sarah.zhang@example.com',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120',
    role: 'Legal Counsel',
    department: 'Legal Services',
    category: {
      l1: 'Professional Services',
      l2: 'Legal Services'
    },
    status: 'active',
    lastActive: '2025-03-20T10:45:00',
  },
  {
    id: 'user4',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=120',
    role: 'Compliance Officer',
    department: 'Compliance',
    category: {
      l1: 'Professional Services',
      l2: 'Compliance'
    },
    status: 'active',
    lastActive: '2025-03-19T16:20:00',
  },
  {
    id: 'user5',
    name: 'Alex Nguyen',
    email: 'alex.nguyen@example.com',
    avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=120',
    role: 'External Counsel',
    department: 'External',
    category: {
      l1: 'Professional Services',
      l2: 'Legal Services'
    },
    status: 'invited',
    lastActive: null,
  },
  {
    id: 'user6',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=120',
    role: 'Document Reviewer',
    department: 'Document Management',
    category: {
      l1: 'IT',
      l2: 'Document Management'
    },
    status: 'active',
    lastActive: '2025-03-18T09:30:00',
  },
  {
    id: 'user7',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120',
    role: 'General Counsel',
    department: 'Legal Services',
    category: {
      l1: 'Professional Services',
      l2: 'Legal Services'
    },
    status: 'active',
    lastActive: '2025-03-19T14:10:00',
  },
];

const CollaboratorsList: React.FC<CollaboratorsListProps> = ({ 
  searchQuery,
  selectedL1 = [],
  selectedL2 = []
}) => {
  const [actionMenuUser, setActionMenuUser] = useState<string | null>(null);
  
  // Filter collaborators based on search query and category filters
  const filteredCollaborators = collaborators.filter((user) => {
    // Apply search filter
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply category filters
    const matchesL1 = selectedL1.length === 0 || (user.category && selectedL1.includes(user.category.l1));
    const matchesL2 = selectedL2.length === 0 || (user.category && selectedL2.includes(user.category.l2));
    
    return matchesSearch && matchesL1 && matchesL2;
  });

  const toggleActionMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionMenuUser(actionMenuUser === id ? null : id);
  };

  const formatLastActive = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              User
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Role
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
              Last Active
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredCollaborators.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.avatar}
                      alt={user.name}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 flex items-center">
                  {user.role === 'Legal Admin' && (
                    <Shield className="h-4 w-4 text-primary-500 mr-1" />
                  )}
                  {user.role}
                </div>
                <div className="text-xs text-gray-500">
                  {user.department}
                  {user.category && (
                    <span className="ml-1">
                      ({user.category.l1} / {user.category.l2})
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : user.status === 'invited'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatLastActive(user.lastActive)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center space-x-2">
                  <button
                    className="text-primary-600 hover:text-primary-900"
                    title="Email User"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                  <button
                    className="text-primary-600 hover:text-primary-900"
                    title="Edit User"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <div className="relative">
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      title="More actions"
                      onClick={(e) => toggleActionMenu(user.id, e)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {actionMenuUser === user.id && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu">
                          <a
                            href="#!"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                            onClick={(e) => {
                              e.preventDefault();
                              setActionMenuUser(null);
                            }}
                          >
                            View Profile
                          </a>
                          <a
                            href="#!"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                            onClick={(e) => {
                              e.preventDefault();
                              setActionMenuUser(null);
                            }}
                          >
                            Manage Permissions
                          </a>
                          <a
                            href="#!"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                            onClick={(e) => {
                              e.preventDefault();
                              setActionMenuUser(null);
                            }}
                          >
                            Reset Password
                          </a>
                          <a
                            href="#!"
                            className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            role="menuitem"
                            onClick={(e) => {
                              e.preventDefault();
                              setActionMenuUser(null);
                            }}
                          >
                            Revoke Access
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
          {filteredCollaborators.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                No team members found matching your search criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CollaboratorsList;