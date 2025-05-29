export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  weight: number;
  rating: number | null;
  scoringGuide?: {
    levels: Array<{
      score: number;
      description: string;
    }>;
  };
  supplierResponse?: {
    rating: number;
    comment: string;
    attachments: string[];
    submittedAt: string;
    submittedBy: string;
    evidence?: string;
    notes?: string;
  };
}

export interface EvaluationSection {
  id: string;
  name: string;
  description: string;
  weight: number;
  criteria: EvaluationCriterion[];
  minimumScore?: number;
  targetScore?: number;
}

export interface EvaluationSubCategory {
  id: string;
  name: string;
  description: string;
  weight: number;
  sections: EvaluationSection[];
  minimumScore?: number;
  targetScore?: number;
}

export interface EvaluationMainCategory {
  id: string;
  name: string;
  description: string;
  weight: number;
  subCategories: EvaluationSubCategory[];
  minimumScore?: number;
  targetScore?: number;
}

export interface VendorRating {
  vendorId: string;
  vendorName: string;
  status: 'draft' | 'in_progress' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  lastUpdated: string;
  ratings: {
    [criterionId: string]: number;
  };
  responses: {
    [criterionId: string]: {
      comment: string;
      attachments: string[];
      evidence?: string;
      notes?: string;
      reviewerComments?: string;
      reviewStatus?: 'pending' | 'approved' | 'rejected';
    };
  };
  totalScore: number;
  categoryScores: {
    [categoryId: string]: number;
  };
  reviewHistory: Array<{
    date: string;
    reviewer: string;
    action: string;
    comments: string;
  }>;
}

export interface EvaluationTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  createdBy: string;
  createdAt: string;
  modifiedBy: string;
  modifiedAt: string;
  mainCategories: EvaluationMainCategory[];
  vendors: VendorRating[];
  settings: {
    allowSelfAssessment: boolean;
    requireEvidence: boolean;
    minimumOverallScore: number;
    targetOverallScore: number;
    scoringSystem: {
      min: number;
      max: number;
      step: number;
      labels: {
        [score: number]: string;
      };
    };
    reviewProcess: {
      requireSecondaryReview: boolean;
      automaticApprovalThreshold?: number;
      escalationThreshold?: number;
    };
  };
}