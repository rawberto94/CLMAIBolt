import React, { useState } from 'react';
import { Users, MessageSquare, Search, Mail, Clock, UserPlus, Plus, Filter, ChevronDown, ChevronUp, AlertCircle, Briefcase, Building2, FileText } from 'lucide-react';
import CollaboratorsList from './CollaboratorsList';
import DocumentComments from './DocumentComments';
import DocumentCollaboration from './DocumentCollaboration';
import ChatModal from './ChatModal';
import SupplierChatModal from './SupplierChatModal';
import ClientChatModal from './ClientChatModal';
import ProjectSelector from '../shared/ProjectSelector';
import InviteUserModal from './InviteUserModal';
import TaxonomyFilter from '../shared/TaxonomyFilter';
import FilterPanel from '../shared/FilterPanel';

interface FilterState {
  status: string[];
  priority: string[];
  assignee: string[];
  dateRange: { start: string; end: string };
}

interface CollaborationPageProps {
  showNewDiscussion?: boolean;
}

const CollaborationPage: React.FC<CollaborationPageProps> = ({ showNewDiscussion = false }) => {
  const [activeTab, setActiveTab] = useState('documents');
  const [collaborationType, setCollaborationType] = useState<'internal' | 'supplier' | 'client'>('internal');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [showSupplierChatModal, setShowSupplierChatModal] = useState(false);
  const [showClientChatModal, setShowClientChatModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedL1, setSelectedL1] = useState<string[]>([]);
  const [selectedL2, setSelectedL2] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    priority: [],
    assignee: [],
    dateRange: { start: '', end: '' }
  });
  const [sortField, setSortField] = useState<'date' | 'priority' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(null);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const stats = {
    totalDiscussions: 24,
    activeDiscussions: 12,
    resolvedDiscussions: 8,
    pendingDiscussions: 4,
    totalParticipants: 15,
    averageResponseTime: '2.5 hours'
  };

  // Show chat modal when showNewDiscussion prop is true
  React.useEffect(() => {
    if (showNewDiscussion) {
      setShowChatModal(true);
    }
  }, [showNewDiscussion]);

  // Calculate active filters count
  React.useEffect(() => {
    let count = 0;
    count += selectedL1.length;
    count += selectedL2.length;
    count += filters.status.length;
    count += filters.priority.length;
    count += filters.assignee.length;
    if (filters.dateRange.start) count++;
    if (filters.dateRange.end) count++;
    setActiveFiltersCount(count);
  }, [selectedL1, selectedL2, filters]);

  const handleFilterReset = () => {
    setSelectedL1([]);
    setSelectedL2([]);
    setFilters({
      status: [],
      priority: [],
      assignee: [],
      dateRange: { start: '', end: '' }
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collaboration</h1>
          <div className="mt-2 flex space-x-4">
            <button
              onClick={() => setCollaborationType('internal')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                collaborationType === 'internal'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Internal Collaboration
            </button>
            <button
              onClick={() => setCollaborationType('supplier')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                collaborationType === 'supplier'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="h-4 w-4 inline mr-2" />
              Supplier Collaboration
            </button>
            <button
              onClick={() => setCollaborationType('client')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                collaborationType === 'client'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Client Collaboration
            </button>
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex space-x-3">
            <button
              onClick={() => setShowProjectSelector(true)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              {selectedProject || 'Select Project'}
            </button>
            <TaxonomyFilter
              selectedL1={selectedL1}
              selectedL2={selectedL2}
              onL1Change={setSelectedL1}
              onL2Change={setSelectedL2}
            />
            {collaborationType === 'internal' ? (
              <button
                onClick={() => setShowChatModal(true)} 
                className="group relative flex items-center justify-center px-6 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
                New Internal Discussion
                <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
            ) : (
              collaborationType === 'supplier' ? (
                <button
                  onClick={() => setShowSupplierChatModal(true)}
                  className="group relative flex items-center justify-center px-6 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
                  New Contract Change Request
                  <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              ) : (
                <button
                  onClick={() => setShowClientChatModal(true)}
                  className="group relative flex items-center justify-center px-6 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
                  New Client Request
                  <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              )
            )}
            <button 
              onClick={() => setShowInviteModal(true)}
              className="group relative flex items-center justify-center px-6 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-secondary-600 to-secondary-500 hover:from-secondary-700 hover:to-secondary-600 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 px-4 text-center text-sm font-medium ${activeTab === 'documents'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText className="h-5 w-5 mr-2 inline" />
            Document Collaboration
          </button>
          <button
            className={`flex-1 py-4 px-4 text-center text-sm font-medium ${activeTab === 'discussions'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('discussions')}
          >
            <MessageSquare className="h-5 w-5 mr-2 inline" />
            {collaborationType === 'internal' ? 'Contract Discussions' : collaborationType === 'supplier' ? 'Change Requests' : 'Client Requests'}
          </button>
          <button
            className={`flex-1 py-4 px-4 text-center text-sm font-medium ${
              activeTab === 'members'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('members')}
          >
            <Users className="h-5 w-5 mr-2 inline" />
            Team Members
          </button>
          <button
            className={`flex-1 py-4 px-4 text-center text-sm font-medium ${
              activeTab === 'activity'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            <Clock className="h-5 w-5 mr-2 inline" />
            Activity Log
          </button>
        </div>

        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={activeTab === 'discussions'
                ? collaborationType === 'internal' 
                  ? 'Search discussions by title, content, or category...'
                  : collaborationType === 'supplier'
                    ? 'Search change requests by contract, section, or category...'
                    : 'Search client requests by contract, type, or category...'
                : activeTab === 'members'
                ? 'Search team members by name, role, or department...'
                : 'Search activity by type, user, or document...'}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <button
                className="w-full md:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setFilterPanelOpen(!filterPanelOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>

              <FilterPanel
                isOpen={filterPanelOpen}
                onClose={() => setFilterPanelOpen(false)}
                filterGroups={[
                  {
                    id: 'status',
                    label: 'Status',
                    options: ['Open', 'In Progress', 'Resolved', 'Closed'].map(status => ({
                      id: status,
                      label: status
                    })),
                    type: 'checkbox'
                  },
                  {
                    id: 'priority',
                    label: 'Priority',
                    options: ['High', 'Medium', 'Low'].map(priority => ({
                      id: priority,
                      label: priority
                    })),
                    type: 'checkbox'
                  }
                ]}
                selectedFilters={{
                  status: filters.status,
                  priority: filters.priority
                }}
                onFilterChange={(groupId, selectedOptions) => {
                  setFilters(prev => ({
                    ...prev,
                    [groupId]: selectedOptions
                  }));
                }}
                selectedL1={selectedL1}
                selectedL2={selectedL2}
                onL1Change={setSelectedL1}
                onL2Change={setSelectedL2}
                sortOptions={[
                  { field: 'date', label: 'Date' },
                  { field: 'priority', label: 'Priority' },
                  { field: 'status', label: 'Status' }
                ]}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={(field) => setSortField(field as any)}
                onSortDirectionChange={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                dateRange={filters.dateRange}
                onDateRangeChange={(range) => setFilters(prev => ({
                  ...prev,
                  dateRange: range
                }))}
                onReset={handleFilterReset}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Discussion Status</h3>
            <span className="text-2xl font-bold text-primary-600">{stats.totalDiscussions}</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Active</span>
              <span className="font-medium text-gray-900">{stats.activeDiscussions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(stats.activeDiscussions / stats.totalDiscussions) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Resolved</span>
              <span className="font-medium text-gray-900">{stats.resolvedDiscussions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(stats.resolvedDiscussions / stats.totalDiscussions) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Team Engagement</h3>
            <span className="text-2xl font-bold text-primary-600">{stats.totalParticipants}</span>
          </div>
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-900">Response Time</div>
            <div className="mt-2 text-sm text-gray-500">Average across all discussions</div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900">{stats.averageResponseTime}</div>
                <div className="text-xs text-gray-500">Avg. Response</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900">92%</div>
                <div className="text-xs text-gray-500">Participation Rate</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Priority Overview</h3>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">High Priority</span>
                <span className="font-medium text-gray-900">5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Medium Priority</span>
                <span className="font-medium text-gray-900">8</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Low Priority</span>
                <span className="font-medium text-gray-900">7</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === 'documents' && (
          <div className="lg:col-span-3">
            <DocumentCollaboration />
          </div>
        )}
        
        {activeTab === 'discussions' && (
          <>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary-600" />
                    {collaborationType === 'internal' ? 'Recent Document Comments' : collaborationType === 'supplier' ? 'Contract Change Requests' : 'Client Requests'}
                  </h2>
                </div>
                <DocumentComments 
                  searchQuery={searchQuery} 
                  mode={collaborationType} 
                  selectedL1={selectedL1}
                  selectedL2={selectedL2}
                />
              </div>
            </div>

            <div>
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Document Activity</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="border rounded-md p-3">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        Master Service Agreement - Acme Corp
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">Last updated: 2 hours ago</p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          <img
                            className="h-6 w-6 rounded-full ring-2 ring-white"
                            src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=120"
                            alt="User"
                          />
                          <img
                            className="h-6 w-6 rounded-full ring-2 ring-white"
                            src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=120"
                            alt="User"
                          />
                          <img
                            className="h-6 w-6 rounded-full ring-2 ring-white"
                            src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120"
                            alt="User"
                          />
                        </div>
                        <button className="text-primary-600 text-xs font-medium">View</button>
                      </div>
                    </div>

                    <div className="border rounded-md p-3">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        Non-Disclosure Agreement - XYZ Inc.
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">Last updated: 5 hours ago</p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          <img
                            className="h-6 w-6 rounded-full ring-2 ring-white"
                            src="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=120"
                            alt="User"
                          />
                          <img
                            className="h-6 w-6 rounded-full ring-2 ring-white"
                            src="https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=120"
                            alt="User"
                          />
                        </div>
                        <button className="text-primary-600 text-xs font-medium">View</button>
                      </div>
                    </div>

                    <div className="border rounded-md p-3">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        GDPR Compliance Report - Q1 2025
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">Last updated: 1 day ago</p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          <img
                            className="h-6 w-6 rounded-full ring-2 ring-white"
                            src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=120"
                            alt="User"
                          />
                          <img
                            className="h-6 w-6 rounded-full ring-2 ring-white"
                            src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120"
                            alt="User"
                          />
                          <div className="h-6 w-6 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-xs font-medium text-gray-500">
                            +2
                          </div>
                        </div>
                        <button className="text-primary-600 text-xs font-medium">View</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'members' && (
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary-600" />
                  Team Members {selectedL1.length > 0 && `(Filtered by ${selectedL1.join(', ')})`}
                </h2>
              </div>
              <CollaboratorsList 
                searchQuery={searchQuery} 
                selectedL1={selectedL1}
                selectedL2={selectedL2}
              />
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                <Clock className="h-5 w-5 mr-2 text-primary-600" />
                Activity Log
              </h2>

              <div className="border-l-2 border-gray-200 pl-4 space-y-6">
                <div className="relative">
                  <div className="absolute -left-6 mt-1">
                    <div className="h-4 w-4 rounded-full bg-green-500 border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Jane Smith commented on Master Service Agreement
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Today, 10:30 AM</p>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                      "We need to revise section 5.3 regarding the payment terms to align with our
                      updated financial policies."
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 mt-1">
                    <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Robert Wilson uploaded a new version of Employment Contract Template
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Today, 9:15 AM</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 mt-1">
                    <div className="h-4 w-4 rounded-full bg-yellow-500 border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Compliance check completed for Non-Disclosure Agreement - XYZ Inc.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Yesterday, 4:45 PM</p>
                    <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-700">
                      Warning: Missing confidentiality terms in section 3.2
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 mt-1">
                    <div className="h-4 w-4 rounded-full bg-purple-500 border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Alex Johnson shared GDPR Compliance Report with Legal Team
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Yesterday, 2:30 PM</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 mt-1">
                    <div className="h-4 w-4 rounded-full bg-green-500 border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Sarah Zhang commented on Software License Agreement
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Yesterday, 11:20 AM</p>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                      "The liability clause needs to be updated to include the new regulations that
                      went into effect this quarter."
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 mt-1">
                    <div className="h-4 w-4 rounded-full bg-red-500 border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      System detected a potential security concern in document access
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 days ago, 8:45 AM</p>
                    <div className="mt-2 p-3 bg-red-50 border-l-4 border-red-400 text-sm text-red-700">
                      Alert: Unusual access pattern detected for confidential documents. Security
                      team has been notified.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                  Load More Activity
                </button>
              </div>
            </div>
          
          </div>
        )}
      </div>

      {showChatModal && <ChatModal onClose={() => setShowChatModal(false)} />}
      {showSupplierChatModal && <SupplierChatModal onClose={() => setShowSupplierChatModal(false)} />}
      {showClientChatModal && <ClientChatModal onClose={() => setShowClientChatModal(false)} />}
      {showInviteModal && <InviteUserModal onClose={() => setShowInviteModal(false)} />}
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
    </div>
  );
};

export default CollaborationPage;