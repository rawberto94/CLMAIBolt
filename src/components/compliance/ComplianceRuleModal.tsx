import React, { useState } from 'react';
import { X, Plus, Trash2, AlertTriangle } from 'lucide-react';

interface ComplianceRuleModalProps {
  onClose: () => void;
  onSave: (rule: any) => void;
  clients?: string[];
  mode: 'create' | 'edit';
  initialData?: any;
}

const ComplianceRuleModal: React.FC<ComplianceRuleModalProps> = ({
  onClose,
  onSave,
  clients = [],
  mode = 'create',
  initialData
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    severity: initialData?.severity || 'medium',
    clients: initialData?.clients || [],
    conditions: initialData?.conditions || [{ field: '', operator: '', value: '' }],
    actions: initialData?.actions || [{ type: '', details: '' }],
    validationScript: initialData?.validationScript || '',
    isActive: initialData?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { field: '', operator: '', value: '' }]
    }));
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { type: '', details: '' }]
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Create New Compliance Rule' : 'Edit Compliance Rule'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rule Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                rows={3}
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                >
                  <option value="">Select category</option>
                  <option value="legal">Legal</option>
                  <option value="financial">Financial</option>
                  <option value="operational">Operational</option>
                  <option value="regulatory">Regulatory</option>
                  <option value="security">Security</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Severity</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={formData.severity}
                  onChange={e => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Applicable Clients</label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {clients.map(client => (
                  <label key={client} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={formData.clients.includes(client)}
                      onChange={e => {
                        setFormData(prev => ({
                          ...prev,
                          clients: e.target.checked
                            ? [...prev.clients, client]
                            : prev.clients.filter(c => c !== client)
                        }));
                      }}
                    />
                    <span className="ml-2 text-sm text-gray-700">{client}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Conditions</label>
                <button
                  type="button"
                  onClick={addCondition}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  <Plus className="h-4 w-4 inline mr-1" />
                  Add Condition
                </button>
              </div>
              <div className="space-y-3">
                {formData.conditions.map((condition, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={condition.field}
                      onChange={e => {
                        const newConditions = [...formData.conditions];
                        newConditions[index].field = e.target.value;
                        setFormData(prev => ({ ...prev, conditions: newConditions }));
                      }}
                      required
                    >
                      <option value="">Select field</option>
                      <option value="contractValue">Contract Value</option>
                      <option value="contractType">Contract Type</option>
                      <option value="duration">Duration</option>
                      <option value="jurisdiction">Jurisdiction</option>
                    </select>
                    <select
                      className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={condition.operator}
                      onChange={e => {
                        const newConditions = [...formData.conditions];
                        newConditions[index].operator = e.target.value;
                        setFormData(prev => ({ ...prev, conditions: newConditions }));
                      }}
                      required
                    >
                      <option value="">Select operator</option>
                      <option value="equals">Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greaterThan">Greater Than</option>
                      <option value="lessThan">Less Than</option>
                    </select>
                    <input
                      type="text"
                      className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Value"
                      value={condition.value}
                      onChange={e => {
                        const newConditions = [...formData.conditions];
                        newConditions[index].value = e.target.value;
                        setFormData(prev => ({ ...prev, conditions: newConditions }));
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Actions</label>
                <button
                  type="button"
                  onClick={addAction}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  <Plus className="h-4 w-4 inline mr-1" />
                  Add Action
                </button>
              </div>
              <div className="space-y-3">
                {formData.actions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={action.type}
                      onChange={e => {
                        const newActions = [...formData.actions];
                        newActions[index].type = e.target.value;
                        setFormData(prev => ({ ...prev, actions: newActions }));
                      }}
                      required
                    >
                      <option value="">Select action</option>
                      <option value="notify">Send Notification</option>
                      <option value="flag">Flag for Review</option>
                      <option value="block">Block Progression</option>
                      <option value="escalate">Escalate</option>
                    </select>
                    <input
                      type="text"
                      className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Action details"
                      value={action.details}
                      onChange={e => {
                        const newActions = [...formData.actions];
                        newActions[index].details = e.target.value;
                        setFormData(prev => ({ ...prev, actions: newActions }));
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Custom Validation Script</label>
              <div className="mt-1 relative">
                <textarea
                  className="block w-full h-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono text-sm"
                  value={formData.validationScript}
                  onChange={e => setFormData(prev => ({ ...prev, validationScript: e.target.value }))}
                  placeholder="// JavaScript validation code"
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                  <AlertTriangle className="h-4 w-4 inline mr-1 text-yellow-500" />
                  Use with caution
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Custom JavaScript code for complex validation logic. Will be executed in a sandboxed environment.
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.isActive}
                onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <label className="ml-2 block text-sm text-gray-900">
                Rule is active
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
            >
              {mode === 'create' ? 'Create Rule' : 'Update Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplianceRuleModal;