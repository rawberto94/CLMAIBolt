export interface Document {
  id: string;
  title: string;
  type: string; 
  projectId?: string;
  project?: {
    id: string;
    name: string;
  };
  supplierId?: string;
  category: {
    l1: string;
    l2: string;
  };
  tags: string[];
  created: string;
  modified: string;
  status: 'approved' | 'pending' | 'flagged';
  version: string;
  size: string;
  parties: {
    supplier: {
      name: string;
      id: string;
    };
    client: {
      name: string;
      id: string; 
    };
  };
  summary: string;
}