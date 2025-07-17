import { api } from './api';
import { Comment, CreateCommentRequest, UpdateCommentRequest, CommentsResponse } from '../types';
export interface GetCommentsParams {
  page?: number;
  limit?: number;
  postId?: string;
  parentId?: string;
  includeDeleted?: boolean;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  userId?: string; // Optional filter by specific user
}

export const commentsApi = {
  // Get all comments with pagination
      getAllComments: async ({
      page = 1,
      limit = 20,
      postId,
      parentId,
      includeDeleted = false,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      userId,
    }: {
      page?: number;
      limit?: number;
      postId?: any;
      parentId?: any;
      includeDeleted?: boolean;
      sortBy?: string;
      sortOrder?: string;
      userId?: any;
    }): Promise<CommentsResponse> => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(postId && { postId }),
        ...(parentId && { parentId }),
        ...(includeDeleted && { includeDeleted: 'true' }),
        ...(userId && { userId }),
      });

      const response = await api.get(`/comments?${queryParams}`);
      return response.data;
    },


  // Get comments for the current user
  getUserComments: async (page: number = 1, limit: number = 20): Promise<CommentsResponse> => {
    const response = await api.get(`/comments/user?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get comment tree (comment with all replies)
  getCommentTree: async (commentId: string): Promise<Comment> => {
    const response = await api.get(`/comments/${commentId}/tree`);
    return response.data;
  },

  // Create new comment
  createComment: async (commentData: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post('/comments', commentData);
    return response.data;
  },

  // Update comment
  updateComment: async (commentId: string, updateData: UpdateCommentRequest): Promise<Comment> => {
    const response = await api.put(`/comments/${commentId}`, updateData);
    return response.data;
  },

  // Delete comment
  deleteComment: async (commentId: string): Promise<Comment> => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },

  // Restore deleted comment
  restoreComment: async (commentId: string): Promise<Comment> => {
    const response = await api.post(`/comments/${commentId}/restore`);
    return response.data;
  },

  // For full nested thread including replies
  getCommentThread: async (rootId: string): Promise<Comment[]> => {
    const res = await api.get(`/comments/${rootId}/tree`);
    return res.data;
  },
};