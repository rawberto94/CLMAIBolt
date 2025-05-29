export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  category?: {
    l1: string;
    l2: string;
  };
  status: 'active' | 'inactive' | 'invited';
  lastActive: string | null;
}