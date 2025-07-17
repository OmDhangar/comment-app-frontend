import React, { useEffect, useState } from 'react';
import { Comment } from '../types';
import { CommentCard } from './CommentCard';
import { commentsApi } from '../api/comments';
import toast from 'react-hot-toast';

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
    
    // Update local state
    await loadReplies();
    
    // Update parent comment's reply count
    setLocalComment(prev => ({
      ...prev,
      _count: {
        ...prev._count,
        replies: (prev._count?.replies || 0) + 1
      }
    }));
    
    setShowReplies(true);
    onUpdate();
  } catch (error: any) {
    const message = error?.response?.data?.message || 'Failed to add reply';
    toast.error(message);
    await loadReplies();
  }
};

const handleEdit = async (content: string) => {
  try {
    const updatedComment = await commentsApi.updateComment(comment.id, { content });
    
    setLocalComment(prev => ({
      ...prev,
      content: updatedComment.content,
      isEdited: true,
      updatedAt: updatedComment.updatedAt
    }));
    
    toast.success('Comment updated successfully');
    onUpdate();
  } catch (error: any) {
    const message = error?.response?.data?.message || 'Failed to edit comment';
    toast.error(message);
    onUpdate();
  }
};

const handleRestore = async () => {
  try {
    const restoredComment = await commentsApi.restoreComment(comment.id);
    
    setLocalComment(prev => ({
      ...prev,
      isDeleted: false,
      content: restoredComment.content
    }));
    
    toast.success('Comment restored successfully');
    onUpdate();
  } catch (error: any) {
    const message = error?.response?.data?.message || 'Failed to restore comment';
    toast.error(message);
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

  function handleDelete(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await commentsApi.deleteComment(comment.id);
        handleReplyDelete(comment.id);
        resolve();
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to delete comment';
        toast.error(message);
        reject(new Error(message));
      }
    });
  }

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