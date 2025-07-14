// CommentCard.tsx - Fixed version with proper restoration visibility
import React, {useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  MoreHorizontal,
  Reply,
  Edit3,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { InlineCommentInput } from './InlineCommentInput';

interface CommentCardProps {
  comment: Comment;
  onReply: (content: string) => Promise<void>;
  onEdit: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onRestore: () => Promise<void>;
  onToggleReplies: () => void;
  showReplies: boolean;
  isReplying: boolean;
  setIsReplying: (value: boolean) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  depth?: number;
  replyCount?: number;
  loadingReplies?: boolean;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onRestore,
  onToggleReplies,
  showReplies,
  isReplying,
  setIsReplying,
  isEditing,
  setIsEditing,
  depth = 0,
  replyCount = 0,
  loadingReplies = false
}) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const isOwner = user?.id === comment.authorId;
  const hasReplies = replyCount > 0;

  // Check if user can restore - owner or admin can restore
  const canRestore = comment.isDeleted && (isOwner );

  const handleReply = async (content: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onReply(content);
      setIsReplying(false);
    } catch (error: any) {
      console.error('Reply error:', error);
      const message = error?.response?.data?.message || 'Failed to reply.';
      setErrorMessage(typeof message === 'string' ? message : message[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (content: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onEdit(content);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Edit error:', error);
      const message = error?.response?.data?.message || 'Failed to edit comment.';
      setErrorMessage(typeof message === 'string' ? message : message[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    setIsDeleting(true);
    setShowMenu(false);
    
    try {
      await onDelete();
    } catch (error: any) {
      console.error('Delete error:', error);
      const message = error?.response?.data?.message || 'Failed to delete comment.';
      setErrorMessage(typeof message === 'string' ? message : message[0]);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await onRestore();
    } catch (error: any) {
      console.error('Restore error:', error);
      const message = error?.response?.data?.message || 'Failed to restore comment.';
      setErrorMessage(typeof message === 'string' ? message : message[0]);
    } finally {
      setIsRestoring(false);
    }
  };

  // Show loading state while deleting
  if (isDeleting) {
    return (
      <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-200' : ''}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 opacity-50">
          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-500">Deleting comment...</span>
          </div>
        </div>
      </div>
    );
  }

  if (comment.isDeleted) {
    return (
      <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-200' : ''}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 italic">This comment has been deleted</span>
              { !isOwner && (
                <span className="text-xs text-gray-400">
                  (by {comment.author.username})
                </span>
              )}
            </div>
            {canRestore && (
              <button
                onClick={handleRestore}
                disabled={isRestoring}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                {isRestoring ? 'Restoring...' : 'Restore'}
              </button>
            )}
          </div>
          {errorMessage && (
            <div className="text-xs text-red-600 mt-2 bg-red-50 border border-red-200 rounded p-2">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-200' : ''}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {comment.author.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-900">{comment.author.username}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              {comment.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
            </div>
          </div>

          {/* Show menu for owner or admin */}
          {(isOwner ) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  {/* Edit option - only for owner */}
                  {isOwner && comment.canEdit && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                        setErrorMessage(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                  )}
                  {/* Delete option - owner or admin */}
                  {(isOwner && comment.canDelete)  && (
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="mb-3">
            <InlineCommentInput
              initialValue={comment.content}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditing(false);
                setErrorMessage(null);
              }}
              placeholder="Edit your comment..."
              submitLabel="Save"
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="mb-3 text-sm text-gray-900 leading-5 whitespace-pre-wrap">
            {comment.content}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="text-xs text-red-600 mb-2 bg-red-50 border border-red-200 rounded p-2">
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <button
            onClick={() => {
              setIsReplying(!isReplying);
              setErrorMessage(null);
            }}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            disabled={isLoading}
          >
            <Reply className="w-3 h-3" />
            Reply
          </button>

          {hasReplies && (
            <button
              onClick={onToggleReplies}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              disabled={loadingReplies}
            >
              {showReplies ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              {loadingReplies ? 'Loading...' : `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
            </button>
          )}
        </div>

        {/* Reply Box */}
        {isReplying && (
          <div className="mt-3">
            <InlineCommentInput
              onSubmit={handleReply}
              onCancel={() => {
                setIsReplying(false);
                setErrorMessage(null);
              }}
              placeholder="Write a reply..."
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};
