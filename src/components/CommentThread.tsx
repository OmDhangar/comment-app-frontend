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
  const [showReplies, setShowReplies] = useState(depth < 2); // Auto-expand first 2 levels
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replies, setReplies] = useState<Comment[]>(comment.replies || []);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const isDemoMode = false;

  const handleReply = async (content: string) => {
    await commentsApi.createComment({
      content,
      parent_id: comment.id,
    });
    await loadReplies(); // refresh replies
    onUpdate();
  };

  const handleEdit = async (content: string) => {
    await commentsApi.updateComment(comment.id, { content });
    onUpdate();
  };

  const handleDelete = async () => {
    await commentsApi.deleteComment(comment.id);
    onUpdate();
  };

  const handleRestore = async () => {
    await commentsApi.restoreComment(comment.id);
    onUpdate();
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
    if (!showReplies && replies.length === 0 && comment._count?.replies > 0) {
      await loadReplies();
    }
    setShowReplies(!showReplies);
  };

  return (
    <div className="space-y-3">
      <CommentCard
        comment={comment}
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
        replyCount={comment._count?.replies || 0}
        loadingReplies={loadingReplies}
      />

      {showReplies && replies.length > 0 && (
        <div className="space-y-3">
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              onUpdate={onUpdate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
