export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  status: 'active' | 'inactive' | 'draft';
  createdBy: string;
  createdDate: string;
  modifiedDate: string;
}