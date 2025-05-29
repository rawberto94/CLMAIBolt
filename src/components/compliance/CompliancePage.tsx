import React, { useState } from 'react';
import { Shield, Plus, Search, Activity, CheckCircle, AlertTriangle, XCircle, Users, Settings, Upload, Briefcase, Bell, Clock, FileText } from 'lucide-react';
import RuleList from './RuleList';
import ComplianceMetrics from './ComplianceMetrics';
import ComplianceRuleModal from './ComplianceRuleModal';
import ChecklistUploadModal from './ChecklistUploadModal';
import ClientSelector from './ClientSelector';
import TaxonomyFilter from '../shared/TaxonomyFilter';
import ProjectSelector from '../shared/ProjectSelector';
import SmartRulesEngine from './SmartRulesEngine';
import RealTimeAlerts from './RealTimeAlerts';
import ContinuousMonitoring from './ContinuousMonitoring';
import AuditTrail from './AuditTrail';

const CompliancePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'rules' | 'smart-rules' | 'alerts' | 'monitoring' | 'audit'>('rules');
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [selectedL1, setSelectedL1] = useState<string[]>([]);
  const [selectedL2, setSelectedL2] = useState<string[]>([]);
  const [alertsCount, setAlertsCount] = useState(5);
  const [monitoringActive, setMonitoringActive] = useState(true);

  const handleCreateRule = (ruleData: any) => {
    console.log('Creating new rule:', ruleData);
    setShowRuleModal(false);
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId);
    setShowClientSelector(false);
  };

  const handleDismissAlert = (alertId: string) => {
    console.log('Dismissing alert:', alertId);
    setAlertsCount(prev => Math.max(0, prev - 1));
  };

  const handleResolveAlert = (alertId: string) => {
    console.log('Resolving alert:', alertId);
    setAlertsCount(prev => Math.max(0, prev - 1));
  };

  const toggleMonitoring = () => {
    setMonitoringActive(!monitoringActive);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance</h1>
          <p className="text-gray-600">
            {selectedProject ? `Project: ${selectedProject} - ` : ''}
            Manage compliance rules and validation
          </p>
        </div>
        <div className="mt-4 sm:mt-0 space-x-3 flex items-center">
          <button
            onClick={() => setShowProjectSelector(true)}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            {selectedProject || 'Select Project'}
          </button>
          <button
            onClick={() => setShowClientSelector(true)}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Users className="h-4 w-4 mr-2" />
            {selectedClient || 'Select Client'}
          </button>
          <TaxonomyFilter
            selectedL1={selectedL1}
            selectedL2={selectedL2}
            onL1Change={setSelectedL1}
            onL2Change={setSelectedL2}
          />
          <button
            onClick={() => setShowRuleModal(true)}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Checklist
          </button>
          <div className="relative">
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
              {alertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                  {alertsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 px-4 text-center text-sm font-medium whitespace-nowrap ${
              activeTab === 'rules'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('rules')}
          >
            <Shield className="h-5 w-5 mr-2 inline" />
            Rules & Validation
          </button>
          <button
            className={`flex-1 py-4 px-4 text-center text-sm font-medium whitespace-nowrap ${
              activeTab === 'smart-rules'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('smart-rules')}
          >
            <Shield className="h-5 w-5 mr-2 inline" />
            Smart Rules
          </button>
          <button
            className={`flex-1 py-4 px-4 text-center text-sm font-medium whitespace-nowrap ${
              activeTab === 'alerts'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('alerts')}
          >
            <Bell className="h-5 w-5 mr-2 inline" />
            Real-time Alerts
            {alertsCount > 0 && (
              <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {alertsCount}
              </span>
            )}
          </button>
          <button
            className={`flex-1 py-4 px-4 text-center text-sm font-medium whitespace-nowrap ${
              activeTab === 'monitoring'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('monitoring')}
          >
            <Clock className="h-5 w-5 mr-2 inline" />
            Continuous Monitoring
          </button>
          <button
            className={`flex-1 py-4 px-4 text-center text-sm font-medium whitespace-nowrap ${
              activeTab === 'audit'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('audit')}
          >
            <FileText className="h-5 w-5 mr-2 inline" />
            Audit Trail
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ComplianceMetrics />
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                {activeTab === 'rules' && (
                  <>
                    <Shield className="h-5 w-5 mr-2 text-primary-600" />
                    Compliance Rules
                  </>
                )}
                {activeTab === 'validation' && (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
                    Validation Results
                  </>
                )}
                {activeTab === 'reports' && (
                  <>
                    <Activity className="h-5 w-5 mr-2 text-primary-600" />
                    Compliance Reports
                  </>
                )}
              </h2>
            </div>

            {activeTab === 'rules' && (
              <div className="p-4">
                <RuleList searchQuery={searchQuery} />
              </div>
            )}            
            {activeTab === 'smart-rules' && (
              <div className="p-4">
                <SmartRulesEngine />
              </div>
            )}
            
            {activeTab === 'alerts' && (
              <div className="p-4">
                <RealTimeAlerts 
                  onDismiss={handleDismissAlert}
                  onResolve={handleResolveAlert}
                />
              </div>
            )}
            
            {activeTab === 'monitoring' && (
              <div className="p-4">
                <ContinuousMonitoring 
                  isActive={monitoringActive}
                  onToggle={toggleMonitoring}
                />
              </div>
            )}
            
            {activeTab === 'audit' && (
              <div className="p-4">
                <AuditTrail />
              </div>
            )}

          </div>
        </div>
      </div>
      
      {showRuleModal && (
        <ComplianceRuleModal
          onClose={() => setShowRuleModal(false)}
          onSave={handleCreateRule}
          mode="create"
          clients={['Client A', 'Client B', 'Client C']}
        />
      )}
      
      {showClientSelector && (
        <ClientSelector
          onClose={() => setShowClientSelector(false)}
          onSelect={handleClientSelect}
          selectedClient={selectedClient}
        />
      )}
      
      {showUploadModal && (
        <ChecklistUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={(data) => {
            console.log('Uploaded checklist data:', data);
            setShowUploadModal(false);
          }}
        />
      )}
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

export default CompliancePage;