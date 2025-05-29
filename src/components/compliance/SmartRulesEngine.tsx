import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Plus, Code, RefreshCw, Settings, Zap, Eye, Edit, Trash2 } from 'lucide-react';

interface SmartRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  status: 'active' | 'inactive' | 'draft';
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  actions: Array<{
    type: string;
    details: string;
  }>;
  lastRun: string;
  lastResult: 'passed' | 'failed' | 'warning' | null;
  createdBy: string;
  createdAt: string;
  aiAssisted: boolean;
}

const SmartRulesEngine: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [showRuleDetails, setShowRuleDetails] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [showGenerationModal, setShowGenerationModal] = useState(false);

  // Sample smart rules
  const smartRules: SmartRule[] = [
    {
      id: 'sr1',
      name: 'GDPR Data Protection Clause Detector',
      description: 'Automatically identifies missing or inadequate GDPR data protection clauses in contracts',
      category: 'Regulatory Compliance',
      severity: 'high',
      status: 'active',
      conditions: [
        { field: 'documentType', operator: 'equals', value: 'contract' },
        { field: 'jurisdiction', operator: 'includes', value: 'EU' }
      ],
      actions: [
        { type: 'flag', details: 'Flag document for review if GDPR clauses are missing' },
        { type: 'notify', details: 'Notify compliance team via email' }
      ],
      lastRun: '2025-03-19T14:30:00',
      lastResult: 'passed',
      createdBy: 'AI Assistant',
      createdAt: '2025-02-15T09:00:00',
      aiAssisted: true
    },
    {
      id: 'sr2',
      name: 'Payment Terms Risk Analyzer',
      description: 'Analyzes payment terms in contracts to identify financial risks',
      category: 'Financial Risk',
      severity: 'medium',
      status: 'active',
      conditions: [
        { field: 'paymentTerms', operator: 'greaterThan', value: '60 days' },
        { field: 'contractValue', operator: 'greaterThan', value: '100000' }
      ],
      actions: [
        { type: 'flag', details: 'Flag for financial review' },
        { type: 'escalate', details: 'Escalate to finance department if value exceeds $250,000' }
      ],
      lastRun: '2025-03-20T10:15:00',
      lastResult: 'warning',
      createdBy: 'Jane Smith',
      createdAt: '2025-01-20T11:30:00',
      aiAssisted: false
    },
    {
      id: 'sr3',
      name: 'Regulatory Change Monitor',
      description: 'Continuously monitors for regulatory changes affecting existing contracts',
      category: 'Regulatory Compliance',
      severity: 'high',
      status: 'active',
      conditions: [
        { field: 'regulatoryUpdate', operator: 'exists', value: 'true' },
        { field: 'affectedRegulations', operator: 'overlaps', value: 'contractRegulations' }
      ],
      actions: [
        { type: 'notify', details: 'Notify legal and compliance teams' },
        { type: 'createTask', details: 'Create contract review task' }
      ],
      lastRun: '2025-03-20T08:00:00',
      lastResult: 'failed',
      createdBy: 'AI Assistant',
      createdAt: '2025-03-01T14:45:00',
      aiAssisted: true
    },
    {
      id: 'sr4',
      name: 'Vendor Risk Assessment',
      description: 'Automatically assesses vendor risk based on contract terms and external data',
      category: 'Vendor Management',
      severity: 'medium',
      status: 'active',
      conditions: [
        { field: 'vendorCategory', operator: 'equals', value: 'critical' },
        { field: 'dataAccess', operator: 'includes', value: 'personalData' }
      ],
      actions: [
        { type: 'calculateRiskScore', details: 'Calculate vendor risk score' },
        { type: 'notify', details: 'Notify security team if risk score exceeds threshold' }
      ],
      lastRun: '2025-03-18T16:20:00',
      lastResult: 'warning',
      createdBy: 'Robert Wilson',
      createdAt: '2025-02-10T09:15:00',
      aiAssisted: false
    }
  ];

  const handleRunRules = async () => {
    setIsRunning(true);
    try {
      // Simulate API call to run rules
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Success notification would go here
    } catch (error) {
      // Error handling would go here
      console.error('Error running rules:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleGenerateRule = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call to generate rule
      await new Promise(resolve => setTimeout(resolve, 3000));
      setShowGenerationModal(false);
      setGenerationPrompt('');
      // Success notification would go here
    } catch (error) {
      // Error handling would go here
      console.error('Error generating rule:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusIcon = (status: 'passed' | 'failed' | 'warning' | null) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-200" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary-600" />
            Smart Rules Engine
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Intelligent rules that automatically detect compliance issues and regulatory gaps
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowGenerationModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-secondary-600 rounded-md hover:bg-secondary-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            AI Generate Rule
          </button>
          <button
            onClick={handleRunRules}
            disabled={isRunning}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Run All Rules
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rule Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Run
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Result
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {smartRules.map((rule) => (
              <tr key={rule.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      {rule.name}
                      {rule.aiAssisted && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          <Zap className="h-3 w-3 mr-1" />
                          AI
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{rule.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    rule.severity === 'high' ? 'bg-red-100 text-red-800' :
                    rule.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rule.severity.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    rule.status === 'active' ? 'bg-green-100 text-green-800' :
                    rule.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {rule.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {rule.lastRun ? new Date(rule.lastRun).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(rule.lastResult)}
                    <span className="ml-2 text-sm text-gray-500">
                      {rule.lastResult ? rule.lastResult.charAt(0).toUpperCase() + rule.lastResult.slice(1) : 'Not run'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setSelectedRule(rule.id);
                        setShowRuleDetails(true);
                      }}
                      className="text-primary-600 hover:text-primary-900"
                      title="View Rule"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="text-primary-600 hover:text-primary-900"
                      title="Edit Rule"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      title="Delete Rule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRuleDetails && selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Rule Details</h3>
              <button
                onClick={() => {
                  setShowRuleDetails(false);
                  setSelectedRule(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Rule details content would go here */}
              <div className="space-y-6">
                {smartRules.filter(r => r.id === selectedRule).map(rule => (
                  <div key={rule.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-medium text-gray-900 flex items-center">
                          {rule.name}
                          {rule.aiAssisted && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              <Zap className="h-3 w-3 mr-1" />
                              AI Generated
                            </span>
                          )}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">{rule.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rule.severity === 'high' ? 'bg-red-100 text-red-800' :
                        rule.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rule.severity.toUpperCase()} SEVERITY
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Conditions</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          {rule.conditions.map((condition, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <div className="w-2 h-2 bg-primary-400 rounded-full mr-2"></div>
                              <span className="font-medium text-gray-700">{condition.field}</span>
                              <span className="mx-2 text-gray-500">{condition.operator}</span>
                              <span className="text-gray-900">{condition.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Actions</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          {rule.actions.map((action, index) => (
                            <div key={index} className="flex items-start text-sm">
                              <div className="w-2 h-2 bg-secondary-400 rounded-full mr-2 mt-1.5"></div>
                              <div>
                                <span className="font-medium text-gray-700">{action.type}</span>
                                <p className="text-gray-500 mt-1">{action.details}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Execution History</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Last Run</p>
                            <p className="text-sm text-gray-500">{new Date(rule.lastRun).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center">
                            {getStatusIcon(rule.lastResult)}
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              {rule.lastResult ? rule.lastResult.charAt(0).toUpperCase() + rule.lastResult.slice(1) : 'Not run'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowRuleDetails(false);
                  setSelectedRule(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
              >
                Run Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {showGenerationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Generate Smart Rule with AI</h3>
              <button
                onClick={() => setShowGenerationModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe the compliance rule you want to create
                </label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  rows={4}
                  value={generationPrompt}
                  onChange={(e) => setGenerationPrompt(e.target.value)}
                  placeholder="E.g., Create a rule that checks for GDPR compliance in contracts with EU customers, focusing on data protection clauses and breach notification requirements."
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">AI Rule Generation</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Our AI will analyze your description and generate a smart rule with appropriate conditions and actions. You can review and modify the rule before activating it.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowGenerationModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateRule}
                disabled={isGenerating || !generationPrompt.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Rule
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartRulesEngine;