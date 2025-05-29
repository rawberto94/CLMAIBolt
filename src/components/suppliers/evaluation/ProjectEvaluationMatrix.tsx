import React, { useState } from 'react';
import { Plus, HelpCircle, Trash2, ChevronDown, ChevronUp, Award, X } from 'lucide-react';
import AddCriterionModal from './AddCriterionModal';
import ScoreGuideModal from './ScoreGuideModal';
import { SupplierResponseModal } from './SupplierResponseModal';
import VendorPerformanceSummary from './VendorPerformanceSummary';

interface ProjectEvaluationMatrixProps {
  vendorId?: string;
  onScoreChange?: () => void;
  showScoringGuide?: boolean;
  onCloseScoringGuide?: () => void;
}

const categories = [
  {
    id: 'functional',
    name: 'Functional Criteria',
    weight: 0.6,
    criteria: [
      {
        id: 'f1',
        name: 'Core Features',
        description: 'Essential functionality required for the project',
        weight: 0.3,
        priority: 'HIGH'
      },
      {
        id: 'f2',
        name: 'Integration Capabilities',
        description: 'Ability to integrate with existing systems',
        weight: 0.2,
        priority: 'MEDIUM'
      }
    ]
  },
  {
    id: 'non-functional',
    name: 'Non-Functional Criteria',
    weight: 0.4,
    criteria: [
      {
        id: 'nf1',
        name: 'Performance',
        description: 'System performance and response times',
        weight: 0.2,
        priority: 'HIGH'
      },
      {
        id: 'nf2',
        name: 'Scalability',
        description: 'Ability to handle increased load',
        weight: 0.1,
        priority: 'MEDIUM'
      }
    ]
  }
];

const vendors = [
  { id: 'v1', name: 'Vendor A', scores: {} },
  { id: 'v2', name: 'Vendor B', scores: {} },
  { id: 'v3', name: 'Vendor C', scores: {} }
];

const ProjectEvaluationMatrix: React.FC<ProjectEvaluationMatrixProps> = ({ 
  vendorId,
  onScoreChange,
  showScoringGuide,
  onCloseScoringGuide
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showSupplierResponse, setShowSupplierResponse] = useState(false);
  const [selectedCriterion, setSelectedCriterion] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddCriterion, setShowAddCriterion] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showScoreGuide, setShowScoreGuide] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [awardedVendor, setAwardedVendor] = useState<string | null>(null);

  // Filter vendors if vendorId is provided
  const displayVendors = vendorId 
    ? vendors.filter(v => v.id === vendorId)
    : vendors;

  // Handle score change
  const handleScoreChange = (vendorId: string, criterionId: string, value: number) => {
    setScores(prev => ({
      ...prev,
      [vendorId]: {
        ...(prev[vendorId] || {}),
        [criterionId]: value
      }
    }));
    onScoreChange?.();
  };

  // Calculate weighted score for a vendor
  const calculateVendorScore = (vendorId: string) => {
    let totalScore = 0;
    let totalWeight = 0;

    categories.forEach(category => {
      category.criteria.forEach(criterion => {
        const score = scores[vendorId]?.[criterion.id];
        if (score !== undefined && score !== null) {
          totalScore += score * criterion.weight;
          totalWeight += criterion.weight;
        }
      });
    });

    return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving scores:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Export results
  const handleExport = () => {
    const data = {
      categories,
      vendors: displayVendors,
      scores,
      totalScores: displayVendors.map(v => ({
        vendor: v.name,
        score: calculateVendorScore(v.id)
      }))
    };

    // Generate export based on selected format
    if (exportFormat === 'pdf') {
      // PDF export logic
      console.log('Exporting as PDF:', data);
    } else {
      // Excel export logic
      console.log('Exporting as Excel:', data);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddCriterion = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowAddCriterion(true);
  };

  const handleSaveCriterion = (criterion: any) => {
    // Handle saving new criterion
    console.log('Saving criterion:', criterion);
    setShowAddCriterion(false);
  };

  const handleRemoveCriterion = (criterionId: string) => {
    // Handle removing criterion
    console.log('Removing criterion:', criterionId);
  };

  // Calculate total score for a vendor
  const calculateTotalScore = (vendorId: string) => {
    let totalScore = 0;
    let totalWeight = 0;

    categories.forEach(category => {
      category.criteria.forEach(criterion => {
        const score = vendors.find(v => v.id === vendorId)?.scores[criterion.id];
        if (score !== undefined) {
          totalScore += score * criterion.weight;
          totalWeight += criterion.weight;
        }
      });
    });

    return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
  };

  // Determine award status
  const determineAwardStatus = (score: number) => {
    if (score >= 85) return { label: 'Qualified', color: 'text-green-600' };
    return { label: 'Not Qualified', color: 'text-red-600' };
  };

  // Award contract to vendor
  const awardContract = (vendorId: string) => {
    const vendorScore = calculateVendorScore(vendorId);
    if (vendorScore >= 85) {
      setAwardedVendor(vendorId);
    } else {
      alert('Vendor must have a score of at least 85% to be awarded the contract.');
    }
  };

  // Scoring guide content
  const scoringGuide = [
    { score: 5, label: 'Excellent', description: 'Exceeds all requirements with exceptional quality' },
    { score: 4, label: 'Good', description: 'Meets all requirements with above-average quality' },
    { score: 3, label: 'Satisfactory', description: 'Meets basic requirements adequately' },
    { score: 2, label: 'Fair', description: 'Partially meets requirements with some deficiencies' },
    { score: 1, label: 'Poor', description: 'Falls significantly short of requirements' },
    { score: 0, label: 'N/A', description: 'Not applicable or cannot be evaluated' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-lg font-medium text-gray-900">Evaluation Matrix</h2>
          <button
            onClick={() => setShowScoreGuide(true)}
            className="ml-2 text-gray-400 hover:text-gray-600"
            title="Scoring Guide"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel')}
              className="mr-2 rounded-md border-gray-300"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Export
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              isDirty && !isSaving
                ? 'bg-primary-600 hover:bg-primary-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                Criteria
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Weight
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              {displayVendors.map(vendor => (
                <th key={vendor.id} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {vendor.name}
                </th>
              ))}
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map(category => (
              <React.Fragment key={category.id}>
                <tr className="bg-gray-50">
                  <td colSpan={4 + displayVendors.length} className="px-6 py-4">
                    <button
                      className="flex items-center text-left w-full"
                      onClick={() => toggleCategory(category.id)}
                    >
                      {expandedCategories.includes(category.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400 mr-2" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <span className="font-medium text-gray-900">{category.name}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({(category.weight * 100).toFixed(0)}%)
                      </span>
                    </button>
                  </td>
                </tr>
                {expandedCategories.includes(category.id) && (
                  <>
                    {category.criteria.map(criterion => (
                      <tr key={criterion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {criterion.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {criterion.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(criterion.weight * 100).toFixed(0)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            criterion.priority === 'HIGH'
                              ? 'bg-red-100 text-red-800'
                              : criterion.priority === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {criterion.priority}
                          </span>
                        </td>
                        {displayVendors.map(vendor => (
                          <td key={vendor.id} className="px-6 py-4 text-center">
                            <select
                              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                              value={scores[vendor.id]?.[criterion.id] || ''}
                              onChange={(e) => handleScoreChange(vendor.id, criterion.id, Number(e.target.value))}
                            >
                              <option value="">-</option>
                              {[0, 1, 2, 3, 4, 5].map(score => (
                                <option key={score} value={score}>{score}</option>
                              ))}
                            </select>
                          </td>
                        ))}
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => handleRemoveCriterion(criterion.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4 + displayVendors.length} className="px-6 py-4">
                        <button
                          onClick={() => handleAddCriterion(category.id)}
                          className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Criterion
                        </button>
                      </td>
                    </tr>
                  </>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scoring Summary and Award Section */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vendor Evaluation Summary</h3>
            <div className="space-y-4">
              {displayVendors.map(vendor => {
                const totalScore = calculateVendorScore(vendor.id);
                const award = determineAwardStatus(totalScore);
                const isAwarded = awardedVendor === vendor.id;
                return (
                  <div key={vendor.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{vendor.name}</span>
                      <span className="text-2xl font-bold text-primary-600">{totalScore.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          totalScore >= 85 ? 'bg-green-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${totalScore}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className={`flex items-center ${award.color}`}>
                        <span className="text-sm font-medium">{award.label}</span>
                      </div>
                      {isAwarded && (
                        <div className="flex items-center text-green-600">
                          <Award className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Contract Awarded</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Award Status</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              {displayVendors.length > 0 && (
                <>
                  {awardedVendor ? (
                    <div className="text-center">
                      <div className="text-xl font-medium text-gray-900 mb-2">
                        Contract Awarded to:
                      </div>
                      <div className="text-2xl font-bold text-green-600 mb-4">
                        {displayVendors.find(v => v.id === awardedVendor)?.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Score: {calculateVendorScore(awardedVendor).toFixed(1)}%
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-6">
                        <div className="text-xl font-medium text-gray-900 mb-2">
                          Select Vendor to Award Contract
                        </div>
                        <div className="text-sm text-gray-600">
                          Minimum required score: 85%
                        </div>
                      </div>
                      <div className="space-y-3">
                        {displayVendors.map(vendor => {
                          const score = calculateVendorScore(vendor.id);
                          const isQualified = score >= 85;
                          return (
                            <button
                              key={vendor.id}
                              className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg ${
                                isQualified
                                  ? 'border-green-500 text-green-700 hover:bg-green-50'
                                  : 'border-gray-300 text-gray-400 cursor-not-allowed'
                              }`}
                              onClick={() => isQualified && awardContract(vendor.id)}
                              disabled={!isQualified}
                            >
                              <span className="font-medium">{vendor.name}</span>
                              <span>{score.toFixed(1)}%</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Performance Summary Section */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Vendor Performance Summary</h3>
        {displayVendors.map(vendor => {
          const totalScore = calculateVendorScore(vendor.id);
          return (
            <VendorPerformanceSummary 
              key={vendor.id}
              vendorName={vendor.name}
              vendorScore={totalScore}
              scores={scores[vendor.id] || {}}
              categories={categories}
            />
          );
        })}
      </div>

      {showAddCriterion && selectedCategory && (
        <AddCriterionModal
          categoryId={selectedCategory}
          onClose={() => setShowAddCriterion(false)}
          onSave={handleSaveCriterion}
        />
      )}

      {showScoreGuide && (
        <ScoreGuideModal onClose={() => setShowScoreGuide(false)} />
      )}

      {showSupplierResponse && selectedCriterion && (
        <SupplierResponseModal
          criterionId={selectedCriterion}
          onClose={() => {
            setShowSupplierResponse(false);
            setSelectedCriterion(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectEvaluationMatrix;