const ProjectEvaluationMatrix: React.FC<ProjectEvaluationMatrixProps> = ({ vendorId }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showSupplierResponse, setShowSupplierResponse] = useState(false);
  const [selectedCriterion, setSelectedCriterion] = useState<string | null>(null);

  // If vendorId is provided, filter to show only that vendor's column
  const displayVendors = vendorId 
    ? vendors.filter(v => v.id === vendorId)
    : vendors;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Importance
                </th>
                {displayVendors.map(vendor => (
                  <th key={vendor.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div>
                      {vendor.name}
                    </div>
                  </th>
                ))}
      </div>
    </div>
  );
};