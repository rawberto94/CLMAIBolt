import React from 'react';

interface EvaluationMatrixProps {
  selectedVendors: string[];
  onVendorSelect: (vendors: string[]) => void;
  selectedProject: string;
  selectedCategories: string[];
}

const EvaluationMatrix: React.FC<EvaluationMatrixProps> = ({ 
  selectedVendors, 
  onVendorSelect,
  selectedProject,
  selectedCategories
}) => {
  const vendors = [
    { id: '1', name: 'Vendor A', score: 85 },
    { id: '2', name: 'Vendor B', score: 92 },
    { id: '3', name: 'Vendor C', score: 78 },
  ];

  const criteria = [
    { id: '1', name: 'Technical Capability', weight: 0.3 },
    { id: '2', name: 'Cost Effectiveness', weight: 0.25 },
    { id: '3', name: 'Project Experience', weight: 0.25 },
    { id: '4', name: 'Support & Maintenance', weight: 0.2 },
  ];

  const filteredCriteria = selectedCategories.length > 0
    ? criteria.filter(criterion => selectedCategories.includes(criterion.name))
    : criteria;

  const scores = {
    '1': { '1': 4.5, '2': 4.8, '3': 4.2, '4': 4.0 },
    '2': { '1': 4.8, '2': 4.5, '3': 4.7, '4': 4.6 },
    '3': { '1': 4.0, '2': 3.8, '3': 4.0, '4': 3.9 },
  };

  const handleVendorSelect = (vendorId: string) => {
    const newSelected = selectedVendors.includes(vendorId)
      ? selectedVendors.filter(id => id !== vendorId)
      : [...selectedVendors, vendorId];
    onVendorSelect(newSelected);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Criteria / Vendor
            </th>
            {vendors.map(vendor => (
              <th
                key={vendor.id}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-2"
                    checked={selectedVendors.includes(vendor.id)}
                    onChange={() => handleVendorSelect(vendor.id)}
                  />
                  {vendor.name}
                  <span className="ml-2 text-primary-600">({vendor.score}%)</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredCriteria.map(criterion => (
            <tr key={criterion.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {criterion.name}
                <span className="text-gray-500 ml-2">({(criterion.weight * 100)}%)</span>
              </td>
              {vendors.map(vendor => (
                <td key={`${vendor.id}-${criterion.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="text-lg font-medium text-gray-900">{scores[vendor.id][criterion.id]}</span>
                    <div className="ml-4 w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${(scores[vendor.id][criterion.id] / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EvaluationMatrix;