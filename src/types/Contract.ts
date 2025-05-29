export interface ContractVersion {
  id: string;
  version: string;
  createdAt: string;
  createdBy: string;
  changes: Array<{
    section: string;
    oldText: string;
    newText: string;
    reason: string;
  }>;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
}

export interface ContractClause {
  id: string;
  title: string;
  content: string;
  section: string;
  tags: string[];
  lastModified: string;
  modifiedBy: string;
  version: string;
  status: 'active' | 'archived' | 'pending_review';
}

export interface Contract {
  id: string;
  title: string;
  type: string;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  parties: {
    company: {
      id: string;
      name: string;
      role: 'client' | 'supplier' | 'partner';
    }[];
  };
  value: {
    amount: number;
    currency: string;
    period?: string;
  };
  dates: {
    effectiveDate: string;
    expirationDate: string;
    nextReviewDate?: string;
    terminationDate?: string;
  };
  terms: {
    paymentTerms: string;
    renewalTerms: string;
    terminationTerms: string;
  };
  compliance: {
    requirements: string[];
    status: 'compliant' | 'non_compliant' | 'review_needed';
    lastReviewDate: string;
    nextReviewDate: string;
  };
  metadata: {
    category: string;
    subcategory: string;
    tags: string[];
    department: string;
    owner: string;
  };
  versions: ContractVersion[];
  clauses: ContractClause[];
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
    uploadedBy: string;
  }>;
  approvals: Array<{
    id: string;
    stage: string;
    status: 'pending' | 'approved' | 'rejected';
    approver: string;
    date?: string;
    comments?: string;
  }>;
  history: Array<{
    id: string;
    action: string;
    user: string;
    date: string;
    details?: string;
  }>;
}