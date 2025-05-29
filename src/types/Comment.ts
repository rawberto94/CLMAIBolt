interface CommentUser {
  id: string;
  name: string;
  avatar: string;
}

interface Reply {
  id: string;
  user: CommentUser;
  text: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  documentId: string;
  documentName: string;
  category?: {
    l1: string;
    l2: string;
  };
  user: CommentUser;
  text: string;
  timestamp: string;
  page: number;
  likes: number;
  replies: Reply[];
}