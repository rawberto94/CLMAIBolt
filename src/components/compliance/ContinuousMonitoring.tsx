import React, { useState } from 'react';
import { Clock, RefreshCw, CheckCircle, AlertTriangle, Calendar, FileText, Settings, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from 'lucide-react';

interface MonitoringItem {
  id: string;
  name: string;
  type: 'contract' | 'regulation' | 'obligation' | 'vendor';
  status: 'active' | 'paused';
  lastChecked: string;
  nextCheck: string;
  frequency: string;
  result?: 'compliant' | 'non_compliant' | 'warning';
  details?: string;
}

interface ContinuousMonitoringProps {
  isActive: boolean;
  onToggle: () => void;
}

const ContinuousMonitoring: React.FC<ContinuousMonitoringProps> = ({ isActive, onToggle }) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [monitoringFrequency, setMonitoringFrequency] = useState('daily');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['contract', 'regulation', 'obligation', 'vendor']);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sample monitoring items
  const monitoringItems: MonitoringItem[] = [
    {
      id: 'mon1',
      name: 'GDPR Compliance Monitor',
      type: 'regulation',
      status: 'active',
      lastChecked: '2025-03-20T08:30:00',
      nextCheck: '2025-03-21T08:30:00',
      frequency: 'Daily',
      result: 'compliant',
      details: 'All contracts with EU entities are GDPR compliant.'
    },
    {
      id: 'mon2',
      name: 'Payment Terms Obligation Tracker',
      type: 'obligation',
      status: 'active',
      lastChecked: '2025-03-20T09:15:00',
      nextCheck: '2025-03-27T09:15:00',
      frequency: 'Weekly',
      result: 'warning',
      details: '2 contracts have upcoming payment deadlines within the next 7 days.'
    },
    {
      id: 'mon3',
      name: 'Vendor Certification Monitor',
      type: 'vendor',
      status: 'active',
      lastChecked: '2025-03-20T10:00:00',
      nextCheck: '2025-04-01T10:00:00',
      frequency: 'Monthly',
      result: 'non_compliant',
      details: '3 vendors have expired security certifications.'
    },
    {
      id: 'mon4',
      name: 'Contract Renewal Tracker',
      type: 'contract',
      status: 'active',
      lastChecked: '2025-03-20T11:30:00',
      nextCheck: '2025-03-21T11:30:00',
      frequency: 'Daily',
      result: 'warning',
      details: '5 contracts are due for renewal within the next 30 days.'
    },
    {
      id: 'mon5',
      name: 'Regulatory Change Scanner',
      type: 'regulation',
      status: 'active',
      lastChecked: '2025-03-20T12:45:00',
      nextCheck: '2025-03-21T12:45:00',
      frequency: 'Daily',
      result: 'compliant',
      details: 'No new regulatory changes affecting current contracts.'
    }
  ];

  // Filter monitoring items based on selected categories
  const filteredItems = monitoringItems.filter(item => 
    selectedCategories.includes(item.type)
  );

  const getStatusIcon = (result?: string) => {
    switch (result) {
      case 'compliant':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'non_compliant':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (result?: string) => {
    switch (result) {
      case 'compliant':
        return 'Compliant';
      case 'non_compliant':
        return 'Non-Compliant';
      case 'warning':
        return 'Warning';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (result?: string) => {
    switch (result) {
      case 'compliant':
        return 'text-green-700 bg-green-50';
      case 'non_compliant':
        return 'text-red-700 bg-red-50';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call to refresh monitoring
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Success notification would go here
    } catch (error) {
      // Error handling would go here
      console.error('Error refreshing monitoring:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary-600" />
            Continuous Compliance Monitoring
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Automated monitoring for contract obligations and regulatory changes
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Now
              </>
            )}
          </button>
          <button
            onClick={onToggle}
            className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-md ${
              isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isActive ? (
              <>
                <ToggleRight className="h-4 w-4 mr-2" />
                Monitoring Active
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4 mr-2" />
                Monitoring Paused
              </>
            )}
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monitoring Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monitoring Frequency
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                value={monitoringFrequency}
                onChange={(e) => setMonitoringFrequency(e.target.value)}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                How often the system should check for compliance issues
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monitor Categories
              </label>
              <div className="space-y-2">
                {['contract', 'regulation', 'obligation', 'vendor'].map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={selectedCategories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== category));
                        }
                      }}
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{category}s</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Monitoring Status</h3>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isActive ? 'Active' : 'Paused'}
              </span>
              <span className="ml-3 text-sm text-gray-500">
                Last refresh: {new Date().toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monitor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frequency
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Check
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Check
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <React.Fragment key={item.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.frequency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.lastChecked)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.nextCheck)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(item.result)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {getStatusText(item.result)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      {expandedItem === item.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                </tr>
                {expandedItem === item.id && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Details</h4>
                          <div className={`p-3 rounded-md ${getStatusColor(item.result)}`}>
                            <p className="text-sm">{item.details}</p>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            View Full Report
                          </button>
                          <button className="px-3 py-1 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700">
                            Run Now
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Compliance Deadlines</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Contract Renewal: Software License Agreement - Tech Systems</p>
                <p className="text-xs text-gray-500 mt-1">Due in 15 days (April 5, 2025)</p>
              </div>
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-800">
              View Contract
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 border-l-4 border-red-400 rounded-r-md">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Vendor Certification: Security Compliance - Global Services Inc.</p>
                <p className="text-xs text-gray-500 mt-1">Expired 3 days ago (March 17, 2025)</p>
              </div>
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-800">
              View Vendor
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 border-l-4 border-green-400 rounded-r-md">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Quarterly Compliance Review: GDPR Compliance</p>
                <p className="text-xs text-gray-500 mt-1">Completed on March 15, 2025</p>
              </div>
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-800">
              View Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContinuousMonitoring;