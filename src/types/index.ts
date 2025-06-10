// src/types/index.ts

export * from './Collaborator';
export * from './Comment';
export * from './ComplianceRule';
export * from './Contract';
export * from './Document';
export * from './Evaluation';
export * from './EvaluationCriteria';
export * from './Project';

// Add any other shared types needed by the UI here
export interface AnalysisResult {
  id: string;
  summary: string;
  // ... all the other properties of AnalysisResult
}

export interface AnalysisProgress {
  status: string;
  percentage: number;
}
