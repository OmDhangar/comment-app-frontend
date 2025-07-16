export interface User {
  id: string;
  role?: 'admin' | 'moderator' | 'user';
  username: string;
  email: string;
  avatar?: string;
  createdAt?: string;
}
export interface CheckAuthResponse {
  isAuthenticated: boolean;
  user: User | null;
}

export interface Comment {
  _count: any;
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  parentId?: string;
  rootId?: string;
  depth: number;
  path: string;
  author: {
    id: string;
    username: string;
  };
  replies: Comment[]; // For tree structure
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
}


export interface CreateCommentRequest {
  content: string;
  parent_id?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
}