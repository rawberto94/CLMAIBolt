import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface NewEvaluationModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

const NewEvaluationModal: React.FC<NewEvaluationModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    vendors: [''],
    categories: [
      {
        name: '',
        weight: '',
        criteria: [{ name: '', description: '', weight: '' }],
      },
    ],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addVendor = () => {
    setFormData(prev => ({
      ...prev,
      vendors: [...prev.vendors, ''],
    }));
  };

  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          name: '',
          weight: '',
          criteria: [{ name: '', description: '', weight: '' }],
        },
      ],
    }));
  };

  const addCriterion = (categoryIndex: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.map((category, idx) =>
        idx === categoryIndex
          ? {
              ...category,
              criteria: [...category.criteria, { name: '', description: '', weight: '' }],
            }
          : category
      ),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Evaluation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Evaluation Name</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              rows={3}
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Vendors</label>
              <button
                type="button"
                onClick={addVendor}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Vendor
              </button>
            </div>
            <div className="space-y-2">
              {formData.vendors.map((vendor, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Vendor ${index + 1}`}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={vendor}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      vendors: prev.vendors.map((v, i) => (i === index ? e.target.value : v)),
                    }))
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Categories</label>
              <button
                type="button"
                onClick={addCategory}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </button>
            </div>
            <div className="space-y-4">
              {formData.categories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category Name</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        value={category.name}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            categories: prev.categories.map((cat, idx) =>
                              idx === categoryIndex ? { ...cat, name: e.target.value } : cat
                            ),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weight (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        value={category.weight}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            categories: prev.categories.map((cat, idx) =>
                              idx === categoryIndex ? { ...cat, weight: e.target.value } : cat
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Criteria</label>
                      <button
                        type="button"
                        onClick={() => addCriterion(categoryIndex)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Criterion
                      </button>
                    </div>
                    <div className="space-y-4">
                      {category.criteria.map((criterion, criterionIndex) => (
                        <div key={criterionIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <input
                              type="text"
                              placeholder="Criterion name"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                              value={criterion.name}
                              onChange={e =>
                                setFormData(prev => ({
                                  ...prev,
                                  categories: prev.categories.map((cat, catIdx) =>
                                    catIdx === categoryIndex
                                      ? {
                                          ...cat,
                                          criteria: cat.criteria.map((crit, critIdx) =>
                                            critIdx === criterionIndex
                                              ? { ...crit, name: e.target.value }
                                              : crit
                                          ),
                                        }
                                      : cat
                                  ),
                                }))
                              }
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Description"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                              value={criterion.description}
                              onChange={e =>
                                setFormData(prev => ({
                                  ...prev,
                                  categories: prev.categories.map((cat, catIdx) =>
                                    catIdx === categoryIndex
                                      ? {
                                          ...cat,
                                          criteria: cat.criteria.map((crit, critIdx) =>
                                            critIdx === criterionIndex
                                              ? { ...crit, description: e.target.value }
                                              : crit
                                          ),
                                        }
                                      : cat
                                  ),
                                }))
                              }
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              placeholder="Weight (%)"
                              min="0"
                              max="100"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                              value={criterion.weight}
                              onChange={e =>
                                setFormData(prev => ({
                                  ...prev,
                                  categories: prev.categories.map((cat, catIdx) =>
                                    catIdx === categoryIndex
                                      ? {
                                          ...cat,
                                          criteria: cat.criteria.map((crit, critIdx) =>
                                            critIdx === criterionIndex
                                              ? { ...crit, weight: e.target.value }
                                              : crit
                                          ),
                                        }
                                      : cat
                                  ),
                                }))
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Create Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEvaluationModal;