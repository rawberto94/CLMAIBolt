import React, { useState } from 'react';
import { BarChart2, FileText, AlertTriangle, Clock, Activity, TrendingUp, TrendingDown, DollarSign, Users, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import StatCard from './StatCard';
import RecentDocuments from './RecentDocuments';
import ComplianceOverview from './ComplianceOverview';
import ActivityFeed from './ActivityFeed';

const CATEGORIES = {
  'Banking Services': ['Market Data Services', 'Banking Fees', 'Post Trade Services', 'Banking Services/Undefined', 'Trading Venues'],
  'HR Services': ['HR', 'Contractors'],
  'IT': ['Software', 'Hardware', 'Telco', 'Infrastructure Services', 'IT/Undefined'],
  'Logistics': ['Transportation Services', 'Consumables', 'Warehousing Services'],
  'Marketing': ['Communication & Research', 'Brand, Creative & Content', 'Media & MarTech', 'Live Marketing & Sponsorships', 'Marketing Materials', 'Marketing/Undefined'],
  'Non - Addressable': ['Employee vendors', 'Other not addressable', 'Intercompany'],
  'Outsourcing & Offshoring': ['Application Services (FKA ITO)', 'Business Process Outsourcing'],
  'Professional Services': ['Consulting', 'Legal Services', 'Insurances', 'Translation Services', 'Professional Services/Undefined'],
  'Real Estate & Facilities Management': ['Facilities Management', 'Real Estate', 'Utilities', 'Office supplies & Furniture', 'Real Estate & Facilities Management/Undefined'],
  'Travel': ['Transportation Ground', 'Accommodations', 'Travel Management', 'Transportation Air Travel', 'Travel/Undefined'],
  'Undefined': ['Undefined/Undefined']
};
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardPage: React.FC = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedL1, setSelectedL1] = useState<string[]>([]);
  const [selectedL2, setSelectedL2] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Contract Value Trend Data
  const contractValueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Contract Value ($M)',
        data: [4.2, 5.1, 4.8, 6.2, 5.9, 7.1],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Supplier Distribution Data
  const supplierDistributionData = {
    labels: ['Strategic', 'Preferred', 'Approved', 'New'],
    datasets: [
      {
        label: 'Supplier Count',
        data: [15, 25, 35, 10],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(217, 70, 239, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
      },
    ],
  };

  // Risk Analysis Data
  const riskAnalysisData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Number of Contracts',
        data: [8, 25, 42],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
      },
    ],
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your contract and supplier management system</p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-subtle hover:bg-gray-50 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter by Category
          </button>
          
          {filterOpen && (
            <div className="absolute mt-12 right-8 w-96 bg-white rounded-xl shadow-floating border border-gray-100 z-50 animate-fade-in">
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 font-heading">Category Filter</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(CATEGORIES).map(([l1, l2Categories]) => (
                    <div key={l1} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={selectedL1.includes(l1)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedL1([...selectedL1, l1]);
                              } else {
                                setSelectedL1(selectedL1.filter(cat => cat !== l1));
                                setSelectedL2(selectedL2.filter(cat => !l2Categories.includes(cat)));
                              }
                            }}
                          />
                          <span className="ml-2 text-sm font-medium text-gray-900 hover:text-primary-700 transition-colors duration-200">{l1}</span>
                        </label>
                        <button
                          onClick={() => toggleCategory(l1)}
                          className="text-gray-400 hover:text-primary-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                        >
                          {expandedCategories.includes(l1) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      
                      {expandedCategories.includes(l1) && (
                        <div className="ml-6 space-y-2 pl-2 border-l-2 border-gray-100">
                          {l2Categories.map(l2 => (
                            <label key={l2} className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                checked={selectedL2.includes(l2)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedL2([...selectedL2, l2]);
                                    if (!selectedL1.includes(l1)) {
                                      setSelectedL1([...selectedL1, l1]);
                                    }
                                  } else {
                                    setSelectedL2(selectedL2.filter(cat => cat !== l2));
                                  }
                                }}
                              />
                              <span className="ml-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">{l2}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedL1([]);
                      setSelectedL2([]);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Active Contracts"
          value="253"
          change="+12%"
          changeType="increase"
          icon={<FileText className="h-6 w-6 text-primary-500" />}
          details={{
            label: "Total Value",
            value: "$12.5M"
          }}
        />
        <StatCard
          title="Pending Reviews"
          value="18"
          change="+3"
          changeType="increase"
          icon={<Clock className="h-6 w-6 text-yellow-500" />}
          details={{
            label: "Due This Week",
            value: "8"
          }}
        />
        <StatCard
          title="Risk Score"
          value="Low"
          change="-15%"
          changeType="decrease"
          icon={<AlertTriangle className="h-6 w-6 text-green-500" />}
          details={{
            label: "Issues Resolved",
            value: "12/14"
          }}
        />
        <StatCard
          title="Active Suppliers"
          value="42"
          change="+5"
          changeType="increase"
          icon={<Users className="h-6 w-6 text-accent-500" />}
          details={{
            label: "New This Month",
            value: "3"
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100 hover:shadow-card-hover transition-all duration-300">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center font-heading">
                <TrendingUp className="h-5 w-5 mr-2 text-primary-500" />
                Contract Value Trend
              </h2>
              <p className="text-sm text-gray-500">Last 6 months contract value</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-green-600 flex items-center badge-success px-3 py-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +15.2%
              </span>
            </div>
          </div>
          <div className="h-72">
            <Line
              data={contractValueData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100 hover:shadow-card-hover transition-all duration-300">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center font-heading">
                <Users className="h-5 w-5 mr-2 text-primary-500" />
                Supplier Distribution
              </h2>
              <p className="text-sm text-gray-500">By category</p>
            </div>
          </div>
          <div className="h-72">
            <Bar
              data={supplierDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100 hover:shadow-card-hover transition-all duration-300">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 font-heading">Recent Documents</h2>
            <RecentDocuments />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100 hover:shadow-card-hover transition-all duration-300">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 font-heading">Risk Analysis</h2>
            <div className="h-52">
              <Bar
                data={riskAnalysisData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100 hover:shadow-card-hover transition-all duration-300">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 font-heading">Upcoming Renewals</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Software License - Tech Corp</p>
                  <p className="text-xs text-gray-500">Due in 15 days</p>
                </div>
                <span className="badge-warning">
                  $50,000
                </span>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Service Agreement - ABC Inc</p>
                  <p className="text-xs text-gray-500">Due in 30 days</p>
                </div>
                <span className="badge-secondary">
                  $75,000
                </span>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Maintenance Contract - XYZ Ltd</p>
                  <p className="text-xs text-gray-500">Due in 45 days</p>
                </div>
                <span className="badge-success">
                  $25,000
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;