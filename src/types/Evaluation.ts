export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  priority: 'MUST' | 'TARGET' | 'OPTIONAL';
  weight: number;
  rating: number | null;
  supplierResponse?: {
    rating: number;
    comment: string;
    attachments: string[];
    submittedAt: string;
    submittedBy: string;
  };
}

export interface EvaluationSection {
  id: string;
  name: string;
  description: string;
  criteria: EvaluationCriterion[];
}

export interface EvaluationSubCategory {
  id: string;
  name: string;
  description: string;
  weight: number;
  sections: EvaluationSection[];
}

export interface EvaluationMainCategory {
  id: string;
  name: string;
  description: string;
  weight: number;
  subCategories: EvaluationSubCategory[];
}

export interface VendorRating {
  vendorId: string;
  vendorName: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'reviewed';
  lastUpdated: string;
  ratings: {
    [criterionId: string]: number;
  };
  responses: {
    [criterionId: string]: {
      comment: string;
      attachments: string[];
    };
  };
  totalScore: number;
}

export interface EvaluationTemplate {
  id: string;
  name: string;
  description: string;
  mainCategories: EvaluationMainCategory[];
  vendors: VendorRating[];
}