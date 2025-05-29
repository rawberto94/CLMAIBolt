import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Upload, 
  RefreshCw, 
  Award, 
  Save, 
  Eye, 
  MessageSquare, 
  Mail, 
  FileText,
  HelpCircle,
  Plus,
  Trash2,
  BarChart2
} from 'lucide-react';

interface RfpEvaluationMatrixProps {
  selectedRfp: string | null;
}

interface Vendor {
  id: string;
  name: string;
  scores: Record<string, number>;
  notes: Record<string, string>;
  totalScore?: number;
}

interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
}

interface Category {
  id: string;
  name: string;
  weight: number;
  criteria: Criterion[];
  isExpanded: boolean;
}

const RfpEvaluationMatrix: React.FC<RfpEvaluationMatrixProps> = ({ selectedRfp }) => {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 'cat-1',
      name: 'Technical Capability',
      weight: 0.3,
      isExpanded: true,
      criteria: [
        {
          id: 'crit-1',
          name: 'System Architecture',
          description: 'Evaluation of the proposed system architecture, including scalability, reliability, and security features.',
          weight: 0.4,
          maxScore: 5
        },
        {
          id: 'crit-2',
          name: 'Integration Capabilities',
          description: 'Ability to integrate with existing systems and third-party applications.',
          weight: 0.3,
          maxScore: 5
        },
        {
          id: 'crit-3',
          name: 'User Interface',
          description: 'Usability and intuitiveness of the user interface.',
          weight: 0.3,
          maxScore: 5
        }
      ]
    },
    {
      id: 'cat-2',
      name: 'Implementation Approach',
      weight: 0.25,
      isExpanded: true,
      criteria: [
        {
          id: 'crit-4',
          name: 'Project Management Methodology',
          description: 'Evaluation of the vendor\'s project management approach and methodology.',
          weight: 0.3,
          maxScore: 5
        },
        {
          id: 'crit-5',
          name: 'Implementation Timeline',
          description: 'Reasonableness and feasibility of the proposed implementation timeline.',
          weight: 0.4,
          maxScore: 5
        },
        {
          id: 'crit-6',
          name: 'Training and Knowledge Transfer',
          description: 'Approach to training and knowledge transfer to ensure successful adoption.',
          weight: 0.3,
          maxScore: 5
        }
      ]
    },
    {
      id: 'cat-3',
      name: 'Vendor Experience',
      weight: 0.2,
      isExpanded: true,
      criteria: [
        {
          id: 'crit-7',
          name: 'Similar Projects',
          description: 'Experience with similar projects in terms of size, scope, and industry.',
          weight: 0.5,
          maxScore: 5
        },
        {
          id: 'crit-8',
          name: 'Client References',
          description: 'Quality and relevance of client references provided.',
          weight: 0.5,
          maxScore: 5
        }
      ]
    },
    {
      id: 'cat-4',
      name: 'Cost',
      weight: 0.25,
      isExpanded: true,
      criteria: [
        {
          id: 'crit-9',
          name: 'Total Cost of Ownership',
          description: 'Evaluation of the total cost of ownership, including implementation, licensing, and ongoing support.',
          weight: 0.6,
          maxScore: 5
        },
        {
          id: 'crit-10',
          name: 'Payment Schedule',
          description: 'Reasonableness and flexibility of the proposed payment schedule.',
          weight: 0.4,
          maxScore: 5
        }
      ]
    }
  ]);
  
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: 'vendor-1',
      name: 'Acme Solutions Inc.',
      scores: {},
      notes: {}
    },
    {
      id: 'vendor-2',
      name: 'TechPro Systems',
      scores: {},
      notes: {}
    },
    {
      id: 'vendor-3',
      name: 'Global IT Services',
      scores: {},
      notes: {}
    }
  ]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showScoringGuide, setShowScoringGuide] = useState(false);
  const [showAddCriterionModal, setShowAddCriterionModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newCriterion, setNewCriterion] = useState({
    name: '',
    description: '',
    weight: 0.5,
    maxScore: 5
  });
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    weight: 0.25
  });
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedCriterion, setSelectedCriterion] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState('');
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardedVendor, setAwardedVendor] = useState<string | null>(null);
  const [awardJustification, setAwardJustification] = useState('');
  const [isAwarding, setIsAwarding] = useState(false);
  
  const toggleCategoryExpand = (categoryId: string) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? { ...category, isExpanded: !category.isExpanded } 
        : category
    ));
  };
  
  const handleScoreChange = (vendorId: string, criterionId: string, score: number) => {
    setVendors(prev => prev.map(vendor => 
      vendor.id === vendorId 
        ? { 
            ...vendor, 
            scores: { 
              ...vendor.scores, 
              [criterionId]: score 
            } 
          } 
        : vendor
    ));
    
    // Recalculate total scores
    calculateTotalScores();
  };
  
  const handleAddNote = (vendorId: string, criterionId: string) => {
    setSelectedVendor(vendorId);
    setSelectedCriterion(criterionId);
    
    // Get existing note if any
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      setCurrentNote(vendor.notes[criterionId] || '');
    } else {
      setCurrentNote('');
    }
    
    setShowNoteModal(true);
  };
  
  const handleSaveNote = () => {
    if (!selectedVendor || !selectedCriterion) return;
    
    setVendors(prev => prev.map(vendor => 
      vendor.id === selectedVendor 
        ? { 
            ...vendor, 
            notes: { 
              ...vendor.notes, 
              [selectedCriterion]: currentNote 
            } 
          } 
        : vendor
    ));
    
    setShowNoteModal(false);
    setSelectedVendor(null);
    setSelectedCriterion(null);
    setCurrentNote('');
  };
  
  const calculateTotalScores = () => {
    setVendors(prev => prev.map(vendor => {
      let totalWeightedScore = 0;
      let totalWeight = 0;
      
      categories.forEach(category => {
        let categoryScore = 0;
        let categoryTotalWeight = 0;
        
        category.criteria.forEach(criterion => {
          const score = vendor.scores[criterion.id];
          if (score !== undefined) {
            categoryScore += (score / criterion.maxScore) * criterion.weight;
            categoryTotalWeight += criterion.weight;
          }
        });
        
        if (categoryTotalWeight > 0) {
          const normalizedCategoryScore = categoryScore / categoryTotalWeight;
          totalWeightedScore += normalizedCategoryScore * category.weight;
          totalWeight += category.weight;
        }
      });
      
      const totalScore = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : undefined;
      
      return {
        ...vendor,
        totalScore
      };
    }));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success notification would go here
    } catch (error) {
      // Error handling would go here
      console.error('Error saving evaluation:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleExport = () => {
    // Handle export functionality
    console.log('Exporting evaluation...');
  };
  
  const handleAddCriterion = () => {
    if (!selectedCategory || !newCriterion.name) return;
    
    const newCriterionId = `crit-${Date.now()}`;
    
    setCategories(prev => prev.map(category => 
      category.id === selectedCategory 
        ? { 
            ...category, 
            criteria: [
              ...category.criteria,
              {
                id: newCriterionId,
                name: newCriterion.name,
                description: newCriterion.description,
                weight: newCriterion.weight,
                maxScore: newCriterion.maxScore
              }
            ] 
          } 
        : category
    ));
    
    setShowAddCriterionModal(false);
    setSelectedCategory(null);
    setNewCriterion({
      name: '',
      description: '',
      weight: 0.5,
      maxScore: 5
    });
  };
  
  const handleAddCategory = () => {
    if (!newCategory.name) return;
    
    const newCategoryId = `cat-${Date.now()}`;
    
    setCategories(prev => [
      ...prev,
      {
        id: newCategoryId,
        name: newCategory.name,
        weight: newCategory.weight,
        isExpanded: true,
        criteria: []
      }
    ]);
    
    setShowAddCategoryModal(false);
    setNewCategory({
      name: '',
      weight: 0.25
    });
  };
  
  const handleDeleteCriterion = (categoryId: string, criterionId: string) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? { 
            ...category, 
            criteria: category.criteria.filter(criterion => criterion.id !== criterionId) 
          } 
        : category
    ));
    
    // Remove scores for this criterion
    setVendors(prev => prev.map(vendor => {
      const { [criterionId]: _, ...restScores } = vendor.scores;
      const { [criterionId]: __, ...restNotes } = vendor.notes;
      
      return {
        ...vendor,
        scores: restScores,
        notes: restNotes
      };
    }));
    
    // Recalculate total scores
    calculateTotalScores();
  };
  
  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(category => category.id !== categoryId));
    
    // Remove scores for all criteria in this category
    const criteriaIds = categories
      .find(category => category.id === categoryId)
      ?.criteria.map(criterion => criterion.id) || [];
    
    setVendors(prev => prev.map(vendor => {
      const newScores = { ...vendor.scores };
      const newNotes = { ...vendor.notes };
      
      criteriaIds.forEach(id => {
        delete newScores[id];
        delete newNotes[id];
      });
      
      return {
        ...vendor,
        scores: newScores,
        notes: newNotes
      };
    }));
    
    // Recalculate total scores
    calculateTotalScores();
  };
  
  const handleAward = async () => {
    if (!awardedVendor) return;
    
    setIsAwarding(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success notification would go here
      setShowAwardModal(false);
      setAwardedVendor(null);
      setAwardJustification('');
    } catch (error) {
      // Error handling would go here
      console.error('Error awarding contract:', error);
    } finally {
      setIsAwarding(false);
    }
  };
  
  // Calculate total scores for display
  React.useEffect(() => {
    calculateTotalScores();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
            RFP Evaluation Matrix
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Score and compare vendor proposals using customizable criteria
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowScoringGuide(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Scoring Guide
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Evaluation
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Evaluation Matrix</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="flex items-center px-3 py-1 text-sm font-medium text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </button>
              <button
                onClick={() => setShowAwardModal(true)}
                className="flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                <Award className="h-4 w-4 mr-1" />
                Award Contract
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Criteria
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                {vendors.map((vendor) => (
                  <th key={vendor.id} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div>{vendor.name}</div>
                    {vendor.totalScore !== undefined && (
                      <div className="text-sm font-bold text-primary-600 mt-1">
                        {vendor.totalScore.toFixed(1)}%
                      </div>
                    )}
                  </th>
                ))}
                <th scope="col" className="relative px-6 py-3 w-10">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <React.Fragment key={category.id}>
                  <tr className="bg-gray-50">
                    <td colSpan={vendors.length + 3} className="px-6 py-4">
                      <div className="flex justify-between items-center">
                        <button
                          className="flex items-center text-left"
                          onClick={() => toggleCategoryExpand(category.id)}
                        >
                          {category.isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400 mr-2" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400 mr-2" />
                          )}
                          <span className="font-medium text-gray-900">{category.name}</span>
                          <span className="ml-2 text-sm text-gray-500">
                            ({(category.weight * 100).toFixed(0)}%)
                          </span>
                        </button>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCategory(category.id);
                              setShowAddCriterionModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-800"
                            title="Add Criterion"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  {category.isExpanded && category.criteria.map((criterion) => (
                    <tr key={criterion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {criterion.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {criterion.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(criterion.weight * 100).toFixed(0)}%
                      </td>
                      {vendors.map((vendor) => (
                        <td key={vendor.id} className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <select
                              className="rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                              value={vendor.scores[criterion.id] || ''}
                              onChange={(e) => handleScoreChange(vendor.id, criterion.id, Number(e.target.value))}
                            >
                              <option value="">-</option>
                              {Array.from({ length: criterion.maxScore + 1 }, (_, i) => i).map((score) => (
                                <option key={score} value={score}>{score}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAddNote(vendor.id, criterion.id)}
                              className="mt-1 text-xs text-primary-600 hover:text-primary-800"
                            >
                              {vendor.notes[criterion.id] ? 'Edit Note' : 'Add Note'}
                            </button>
                          </div>
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteCriterion(category.id, criterion.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Criterion"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {category.isExpanded && category.criteria.length === 0 && (
                    <tr>
                      <td colSpan={vendors.length + 3} className="px-6 py-4 text-center text-sm text-gray-500">
                        No criteria defined for this category.
                        <button
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setShowAddCriterionModal(true);
                          }}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          Add Criterion
                        </button>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              <tr className="bg-gray-50 font-medium">
                <td className="px-6 py-4 text-sm text-gray-900">Total Score</td>
                <td className="px-6 py-4 text-sm text-gray-900">100%</td>
                {vendors.map((vendor) => (
                  <td key={vendor.id} className="px-6 py-4 text-center">
                    <span className={`text-lg font-bold ${
                      vendor.totalScore !== undefined && vendor.totalScore >= 80 ? 'text-green-600' :
                      vendor.totalScore !== undefined && vendor.totalScore >= 60 ? 'text-yellow-600' :
                      vendor.totalScore !== undefined ? 'text-red-600' : 'text-gray-400'
                    }`}>
                      {vendor.totalScore !== undefined ? `${vendor.totalScore.toFixed(1)}%` : '-'}
                    </span>
                  </td>
                ))}
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vendor Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">{vendor.name}</h4>
                {vendor.totalScore !== undefined && (
                  <span className={`text-lg font-bold ${
                    vendor.totalScore >= 80 ? 'text-green-600' :
                    vendor.totalScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {vendor.totalScore.toFixed(1)}%
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                {categories.map((category) => {
                  // Calculate category score for this vendor
                  let categoryScore = 0;
                  let categoryTotalWeight = 0;
                  
                  category.criteria.forEach(criterion => {
                    const score = vendor.scores[criterion.id];
                    if (score !== undefined) {
                      categoryScore += (score / criterion.maxScore) * criterion.weight;
                      categoryTotalWeight += criterion.weight;
                    }
                  });
                  
                  const normalizedCategoryScore = categoryTotalWeight > 0 
                    ? (categoryScore / categoryTotalWeight) * 100 
                    : 0;
                  
                  return (
                    <div key={category.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">{category.name}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {normalizedCategoryScore.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            normalizedCategoryScore >= 80 ? 'bg-green-500' :
                            normalizedCategoryScore >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${normalizedCategoryScore}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => window.location.hash = '#tools/rfp/submissions'}
                  className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Submission
                </button>
                <button
                  onClick={() => {
                    setAwardedVendor(vendor.id);
                    setShowAwardModal(true);
                  }}
                  className={`text-sm font-medium px-3 py-1 rounded-md ${
                    vendor.totalScore !== undefined && vendor.totalScore >= 80
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-gray-700 bg-gray-200 cursor-not-allowed'
                  }`}
                  disabled={vendor.totalScore === undefined || vendor.totalScore < 80}
                >
                  <Award className="h-4 w-4 mr-1 inline" />
                  Award
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showScoringGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Scoring Guide</h3>
              <button
                onClick={() => setShowScoringGuide(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl font-bold text-green-600">5</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Excellent</h4>
                    <p className="text-gray-600 mt-1">Exceeds all requirements with exceptional quality and additional value-added features or services.</p>
                  </div>
                </div>
                
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl font-bold text-blue-600">4</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Good</h4>
                    <p className="text-gray-600 mt-1">Meets all requirements with above-average quality and some additional benefits.</p>
                  </div>
                </div>
                
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl font-bold text-yellow-600">3</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Satisfactory</h4>
                    <p className="text-gray-600 mt-1">Meets all basic requirements with acceptable quality.</p>
                  </div>
                </div>
                
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl font-bold text-orange-600">2</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Fair</h4>
                    <p className="text-gray-600 mt-1">Meets most requirements but has some deficiencies or limitations.</p>
                  </div>
                </div>
                
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl font-bold text-red-600">1</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Poor</h4>
                    <p className="text-gray-600 mt-1">Fails to meet several key requirements or has significant deficiencies.</p>
                  </div>
                </div>
                
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl font-bold text-gray-600">0</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Unacceptable</h4>
                    <p className="text-gray-600 mt-1">Does not meet requirements or no response provided.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowScoringGuide(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddCriterionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add Criterion</h3>
              <button
                onClick={() => {
                  setShowAddCriterionModal(false);
                  setSelectedCategory(null);
                  setNewCriterion({
                    name: '',
                    description: '',
                    weight: 0.5,
                    maxScore: 5
                  });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={selectedCategory !== null}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Criterion Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  value={newCriterion.name}
                  onChange={(e) => setNewCriterion(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., System Performance"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  value={newCriterion.description}
                  onChange={(e) => setNewCriterion(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this criterion evaluates"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    value={newCriterion.weight * 100}
                    onChange={(e) => setNewCriterion(prev => ({ ...prev, weight: Number(e.target.value) / 100 }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Score
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    value={newCriterion.maxScore}
                    onChange={(e) => setNewCriterion(prev => ({ ...prev, maxScore: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAddCriterionModal(false);
                  setSelectedCategory(null);
                  setNewCriterion({
                    name: '',
                    description: '',
                    weight: 0.5,
                    maxScore: 5
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCriterion}
                disabled={!selectedCategory || !newCriterion.name}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Add Criterion
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add Category</h3>
              <button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategory({
                    name: '',
                    weight: 0.25
                  });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Vendor Experience"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  value={newCategory.weight * 100}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, weight: Number(e.target.value) / 100 }))}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Note: You may need to adjust weights of other categories to ensure they sum to 100%.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategory({
                    name: '',
                    weight: 0.25
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.name}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add Note</h3>
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setSelectedVendor(null);
                  setSelectedCriterion(null);
                  setCurrentNote('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note for: {vendors.find(v => v.id === selectedVendor)?.name} - {
                    categories.flatMap(c => c.criteria).find(c => c.id === selectedCriterion)?.name
                  }
                </label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  rows={4}
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="Enter your evaluation notes here"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setSelectedVendor(null);
                  setSelectedCriterion(null);
                  setCurrentNote('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {showAwardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Award Contract</h3>
              </div>
              <button
                onClick={() => {
                  setShowAwardModal(false);
                  setAwardedVendor(null);
                  setAwardJustification('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Vendor to Award
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  value={awardedVendor || ''}
                  onChange={(e) => setAwardedVendor(e.target.value)}
                >
                  <option value="">Select a vendor</option>
                  {vendors
                    .filter(vendor => vendor.totalScore !== undefined && vendor.totalScore >= 80)
                    .map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name} ({vendor.totalScore?.toFixed(1)}%)
                      </option>
                    ))}
                </select>
                {vendors.filter(vendor => vendor.totalScore !== undefined && vendor.totalScore >= 80).length === 0 && (
                  <p className="mt-1 text-xs text-red-500">
                    No vendors meet the minimum score threshold (80%) for award.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Award Justification
                </label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  rows={4}
                  value={awardJustification}
                  onChange={(e) => setAwardJustification(e.target.value)}
                  placeholder="Provide justification for this award decision"
                />
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-md">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Awarding this contract will finalize the RFP process and notify the selected vendor. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAwardModal(false);
                  setAwardedVendor(null);
                  setAwardJustification('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAward}
                disabled={isAwarding || !awardedVendor || !awardJustification.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {isAwarding ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4 mr-2" />
                    Award Contract
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

export default RfpEvaluationMatrix;