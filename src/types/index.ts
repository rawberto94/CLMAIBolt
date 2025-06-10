// This is our new, detailed interface for analysis results
export interface AnalysisResult {
  overview: {
    title: string;
    type: string;
    status: string;
    parties: string[];
    effectiveDate: string;
    expirationDate: string;
    totalValue: string;
    description: string;
  };
  financials: {
    totalValue: number;
    currency: string;
    paymentTerms: {
      schedule: string;
      terms: string;
      latePaymentFee: string;
      earlyPaymentDiscount: string;
    };
    rateCards: { role: string; rate: number; unit: string }[];
    fees: { type: string; description: string; cap: string }[];
    invoicingFrequency: string;
    budgetAllocation: {
      year1: number;
      year2: number;
      year3: number;
    };
  };
  obligations: {
    deliverables: { description: string; deadline: string; status: 'On Track' | 'At Risk' | 'Delayed' }[];
    serviceLevel: {
      availability: string;
      responseTime: {
        critical: string;
        high: string;
        medium: string;
        low: string;
      };
      penalties: string;
    };
    reporting: {
      frequency: string;
      contents: string[];
    };
    keyPersonnel: { role: string; replaceability: string }[];
  };
  risks: {
    category: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
    impact: string;
    mitigation: string;
  }[];
  compliance: {
    score: number;
    requirements: { category: string; status: 'Compliant' | 'Partial' | 'Non-Compliant'; details: string }[];
    industryRegulations: { name: string; status: 'Compliant' | 'At Risk' | 'Non-Compliant'; details: string }[];
  };
  recommendations: {
    priority: 'High' | 'Medium' | 'Low';
    description: string;
    benefit: string;
    effort: 'High' | 'Medium' | 'Low';
  }[];
  benchmarks: {
    rateComparison: {
      averageRate: number;
      marketAverage: number;
      percentile: number;
    };
    termComparison: {
      paymentTerms: { contract: string; marketAverage: string; status: string };
      contractLength: { contract: string; marketAverage: string; status: string };
      terminationNotice: { contract: string; marketAverage: string; status: string };
    };
  };
}

// Keep these other types as they are
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    citations?: any[];
}

export interface AnalysisProgress {
    status: string;
    percentage: number;
}
