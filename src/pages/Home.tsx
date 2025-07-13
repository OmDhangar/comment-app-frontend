import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Comment } from '../types';
import { commentsApi } from '../api/comments';
import { CommentThread } from '../components/CommentThread';
import { InlineCommentInput } from '../components/InlineCommentInput';
import { mockComments } from '../data/mockData';

export const Home: React.FC = () => {
  const { user, logout, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // Demo mode check
  const isDemoMode =false;

  const loadComments = async (pageNum: number = 1, append: boolean = false) => {
    // Don't attempt to load comments if user is not authenticated
    if (!isAuthenticated || !user) {
      console.warn('User not authenticated, skipping comment loading');
      return;
    }

    try {
      if (!append) setIsLoading(true);
      
      if (isDemoMode) {
        // Use mock data in demo mode - filter by current user
        const userComments = mockComments.filter(comment => comment.authorId === user?.id);
        const response = {
          comments: userComments,
          total: userComments.length,
          page: pageNum,
          limit: 20,
          hasMore: false,
        };
        
        if (append) {
          setComments(prev => [...prev, ...response.comments]);
        } else {
          setComments(response.comments);
        }
        
        setHasMore(response.hasMore);
        setTotal(response.total);
        setPage(pageNum);
      } else {
        // Fetch user-specific comments
        const response = await commentsApi.getUserComments(pageNum, 20);
        
        if (append) {
          setComments(prev => [...prev, ...response.comments]);
        } else {
          setComments(response.comments);
        }
        
        setHasMore(response.hasMore);
        setTotal(response.total);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to load user comments:', error);
      
      // Check if it's an authentication error
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as any).response === 'object' &&
        (error as any).response !== null &&
        'status' in (error as any).response &&
        (error as any).response.status === 401
      ) {
        console.warn('Authentication failed, logging out');
        await logout();
        return;
      }
      
      if (isDemoMode) {
        // Fallback to mock data if there's an error in demo mode
        const userComments = mockComments.filter(comment => comment.authorId === user?.id);
        setComments(userComments);
        setTotal(userComments.length);
        setHasMore(false);
      } else {
        // Set empty state on error
        setComments([]);
        setTotal(0);
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshComments = async () => {
    setIsRefreshing(true);
    try {
      await loadComments(1, false);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadMoreComments = () => {
    if (hasMore && !isLoading) {
      loadComments(page + 1, true);
    }
  };

  useEffect(() => {
    // Only load comments when auth loading is complete and user is authenticated
    if (!isAuthLoading && isAuthenticated && user) {
      loadComments();
    } else if (!isAuthLoading && !isAuthenticated) {
      // Clear comments if user is not authenticated
      setComments([]);
      setTotal(0);
      setHasMore(false);
    }
  }, [isAuthLoading, isAuthenticated, user]);

  const handleCreateComment = async (content: string) => {
    try {
        await commentsApi.createComment({ content });
        await refreshComments();
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create comment:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show loading state while authentication is being verified
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your comments.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while comments are being fetched
  if (isLoading && comments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  My Comments {isDemoMode && <span className="text-sm font-normal text-blue-600">(Demo)</span>}
                </h1>
                <p className="text-sm text-gray-500">
                  {total} {total === 1 ? 'comment' : 'comments'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={refreshComments}
                disabled={isRefreshing}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Refresh comments"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {user && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900 hidden sm:block">
                      {user.username}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Create Comment */}
        {user && (
          <div className="mb-6">
            {isCreating ? (
              <InlineCommentInput
                onSubmit={handleCreateComment}
                onCancel={() => setIsCreating(false)}
                placeholder="What's on your mind?"
              />
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg text-left text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Share your thoughts...
              </button>
            )}
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
              <p className="text-gray-500 mb-4">Start sharing your thoughts!</p>
              {user && !isCreating && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Comment
                </button>
              )}
            </div>
          ) : (
            comments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                onUpdate={refreshComments}
              />
            ))
          )}
        </div>

        {/* Load More */}
        {hasMore && comments.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={loadMoreComments}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Comments'
              )}
            </button>
          </div>
        )}

        {/* Footer */}
        {comments.length > 0 && !hasMore && (
          <div className="text-center mt-8 text-sm text-gray-500">
            You've reached the end of your comments
          </div>
        )}
      </main>
    </div>
  );
};