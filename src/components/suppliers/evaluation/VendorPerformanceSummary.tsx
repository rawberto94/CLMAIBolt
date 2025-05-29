import React from 'react';
import { BarChart2, CheckCircle, AlertCircle, Award, ThumbsUp, ThumbsDown } from 'lucide-react';

interface VendorPerformanceSummaryProps {
  vendorName: string;
  vendorScore: number;
  scores: Record<string, number>;
  categories: Array<{
    id: string;
    name: string;
    weight: number;
    criteria: Array<{
      id: string;
      name: string;
      description: string;
      weight: number;
      priority: string;
    }>;
  }>;
}

const VendorPerformanceSummary: React.FC<VendorPerformanceSummaryProps> = ({
  vendorName,
  vendorScore,
  scores,
  categories
}) => {
  // Calculate category scores
  const categoryScores = categories.map(category => {
    let totalScore = 0;
    let totalWeight = 0;
    
    category.criteria.forEach(criterion => {
      const score = scores[criterion.id];
      if (score !== undefined && score !== null) {
        totalScore += score * criterion.weight;
        totalWeight += criterion.weight;
      }
    });
    
    const finalScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
    
    return {
      id: category.id,
      name: category.name,
      score: finalScore,
      weight: category.weight
    };
  });
  
  // Identify strengths and weaknesses
  const criteriaScores = categories.flatMap(category => 
    category.criteria.map(criterion => ({
      id: criterion.id,
      name: criterion.name,
      category: category.name,
      score: scores[criterion.id] || 0,
      weight: criterion.weight,
      priority: criterion.priority
    }))
  );
  
  const strengths = criteriaScores
    .filter(c => c.score >= 4)
    .sort((a, b) => b.score - a.score || b.weight - a.weight)
    .slice(0, 3);
    
  const weaknesses = criteriaScores
    .filter(c => c.score <= 2 && c.score > 0)
    .sort((a, b) => a.score - b.score || b.weight - a.weight)
    .slice(0, 3);
  
  // Calculate performance metrics
  const highPriorityCriteria = criteriaScores.filter(c => c.priority === 'HIGH');
  const highPriorityScore = highPriorityCriteria.length > 0 
    ? highPriorityCriteria.reduce((sum, c) => sum + c.score, 0) / highPriorityCriteria.length
    : 0;
  
  const completionRate = criteriaScores.length > 0
    ? criteriaScores.filter(c => c.score > 0).length / criteriaScores.length * 100
    : 0;
  
  // Generate recommendations
  const generateRecommendations = () => {
    const recommendations = [];
    
    if (vendorScore < 70) {
      recommendations.push("Consider alternative vendors with higher overall scores");
    }
    
    if (highPriorityScore < 3) {
      recommendations.push("Vendor does not meet critical requirements, further evaluation needed");
    }
    
    if (weaknesses.length > 0) {
      recommendations.push("Request improvements in identified weak areas before proceeding");
    }
    
    if (vendorScore >= 85) {
      recommendations.push("Vendor meets or exceeds requirements, suitable for contract award");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Request additional information in key areas before making final decision");
    }
    
    return recommendations;
  };
  
  const recommendations = generateRecommendations();
  
  return (
    <div className="mb-10 pb-8 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xl font-semibold text-gray-900">{vendorName}</h4>
        <div className="flex items-center">
          <span className="text-2xl font-bold text-primary-600 mr-2">{vendorScore.toFixed(1)}%</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            vendorScore >= 85 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {vendorScore >= 85 ? 'Qualified' : 'Not Qualified'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <BarChart2 className="h-4 w-4 mr-1 text-primary-500" />
            Performance by Category
          </h5>
          <div className="space-y-4">
            {categoryScores.map(category => (
              <div key={category.id}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    <span className="ml-2 text-xs text-gray-500">({(category.weight * 100).toFixed(0)}%)</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{category.score.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      category.score >= 85 ? 'bg-green-500' :
                      category.score >= 70 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${category.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <ThumbsUp className="h-4 w-4 mr-1 text-green-500" />
                Key Strengths
              </h5>
              {strengths.length > 0 ? (
                <ul className="space-y-2">
                  {strengths.map(strength => (
                    <li key={strength.id} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{strength.name}</p>
                        <p className="text-xs text-gray-500">Score: {strength.score}/5 • Category: {strength.category}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No significant strengths identified</p>
              )}
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <ThumbsDown className="h-4 w-4 mr-1 text-red-500" />
                Areas for Improvement
              </h5>
              {weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {weaknesses.map(weakness => (
                    <li key={weakness.id} className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{weakness.name}</p>
                        <p className="text-xs text-gray-500">Score: {weakness.score}/5 • Category: {weakness.category}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No significant weaknesses identified</p>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Award className="h-4 w-4 mr-1 text-primary-500" />
            Performance Metrics
          </h5>
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">High Priority Criteria</span>
                <span className="font-medium text-gray-900">{highPriorityScore.toFixed(1)}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    highPriorityScore >= 4 ? 'bg-green-500' :
                    highPriorityScore >= 3 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${(highPriorityScore / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Evaluation Completion</span>
                <span className="font-medium text-gray-900">{completionRate.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 mt-4">
              <h6 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h6>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <div className="h-4 w-4 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2 text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-600">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h6 className="text-sm font-medium text-gray-700 mb-2">Executive Summary</h6>
            <p className="text-sm text-gray-600">
              {vendorScore >= 85 ? (
                `${vendorName} demonstrates strong performance across evaluation criteria, particularly excelling in ${strengths[0]?.category || 'key areas'}. With an overall score of ${vendorScore.toFixed(1)}%, this vendor meets or exceeds project requirements and is recommended for selection.`
              ) : vendorScore >= 70 ? (
                `${vendorName} shows adequate performance with a score of ${vendorScore.toFixed(1)}%. While meeting basic requirements, improvements are needed in ${weaknesses[0]?.category || 'certain areas'} before final selection. Additional negotiation or clarification is recommended.`
              ) : (
                `${vendorName} falls below minimum requirements with a score of ${vendorScore.toFixed(1)}%. Significant concerns exist in ${weaknesses[0]?.category || 'multiple areas'}, particularly regarding high-priority criteria. Consider alternative vendors or request substantial improvements.`
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorPerformanceSummary;