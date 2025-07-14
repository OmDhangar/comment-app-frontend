import React, { useEffect, useState } from 'react';
import { Comment } from '../types';
import { CommentCard } from './CommentCard';
import { commentsApi } from '../api/comments';

interface CommentThreadProps {
  comment: Comment;
  onUpdate: () => void;
  depth?: number;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  onUpdate,
  depth = 0,
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replies, setReplies] = useState<Comment[]>(comment.replies || []);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [localComment, setLocalComment] = useState<Comment>(comment);

  // Update local state when comment prop changes
  useEffect(() => {
    setLocalComment(comment);
    setReplies(comment.replies || []);
  }, [comment]);

  const handleReply = async (content: string) => {
    try {
      const newReply = await commentsApi.createComment({
        content,
        parent_id: comment.id,
      });
      
      // Optimistically update local state
      setReplies(prev => [...prev, newReply]);
      
      // Update parent comment's reply count
      setLocalComment(prev => ({
        ...prev,
        _count: {
          ...prev._count,
          replies: (prev._count?.replies || 0) + 1
        }
      }));
      
      // Ensure replies are shown after adding one
      setShowReplies(true);
      
      // Call parent update
      onUpdate();
    } catch (error) {
      console.error('Failed to add reply:', error);
      // Optionally reload replies on error
      await loadReplies();
    }
  };

  const handleEdit = async (content: string) => {
    try {
      const updatedComment = await commentsApi.updateComment(comment.id, { content });
      
      // Optimistically update local state
      setLocalComment(prev => ({
        ...prev,
        content: updatedComment.content,
        isEdited: true,
        updatedAt: updatedComment.updatedAt
      }));
      
      // Call parent update
      onUpdate();
    } catch (error) {
      console.error('Failed to edit comment:', error);
      // Revert on error by calling onUpdate to refresh from parent
      onUpdate();
    }
  };

  const handleDelete = async () => {
    try {
      await commentsApi.deleteComment(comment.id);
      
      // Optimistically update local state
      setLocalComment(prev => ({
        ...prev,
        isDeleted: true,
        content: ''
      }));
      
      // Call parent update
      onUpdate();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      // Revert on error
      onUpdate();
    }
  };

  const handleRestore = async () => {
    try {
      const restoredComment = await commentsApi.restoreComment(comment.id);
      
      // Optimistically update local state
      setLocalComment(prev => ({
        ...prev,
        isDeleted: false,
        content: restoredComment.content
      }));
      
      // Call parent update
      onUpdate();
    } catch (error) {
      console.error('Failed to restore comment:', error);
      onUpdate();
    }
  };

  const loadReplies = async () => {
    setLoadingReplies(true);
    try {
      const thread = await commentsApi.getCommentThread(comment.id);
      const updatedComment = thread.find((c) => c.id === comment.id);
      setReplies(updatedComment?.replies || []);
    } catch (err) {
      console.error('Failed to load replies:', err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const toggleReplies = async () => {
    if (!showReplies && replies.length === 0 && (localComment._count?.replies || 0) > 0) {
      await loadReplies();
    }
    setShowReplies(!showReplies);
  };

  const handleReplyUpdate = () => {
    // When a nested reply is updated, reload this comment's replies
    loadReplies();
  };

  const handleReplyDelete = (deletedReplyId: string) => {
    // Optimistically remove the deleted reply from local state
    setReplies(prev => prev.filter(reply => reply.id !== deletedReplyId));
    
    // Update reply count
    setLocalComment(prev => ({
      ...prev,
      _count: {
        ...prev._count,
        replies: Math.max(0, (prev._count?.replies || 0) - 1)
      }
    }));
    
    // Call parent update
    onUpdate();
  };

  return (
    <div className="space-y-3">
      <CommentCard
        comment={localComment}
        onReply={handleReply}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onToggleReplies={toggleReplies}
        showReplies={showReplies}
        isReplying={isReplying}
        setIsReplying={setIsReplying}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        depth={depth}
        replyCount={localComment._count?.replies || 0}
        loadingReplies={loadingReplies}
      />

      {showReplies && replies.length > 0 && (
        <div className="space-y-3">
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              onUpdate={handleReplyUpdate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};