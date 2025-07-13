import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface InlineCommentInputProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  placeholder?: string;
  initialValue?: string;
  isLoading?: boolean;
  submitLabel?: string;
}

export const InlineCommentInput: React.FC<InlineCommentInputProps> = ({
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  initialValue = "",
  isLoading = false,
  submitLabel = "Comment"
}) => {
  const [content, setContent] = useState(initialValue);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    try {
      setErrorMessage(null); // Clear any previous error
      await onSubmit(content.trim());
      setContent('');
    } catch (error: any) {
      console.error('Failed to submit comment:', error);
      const message = error?.response?.data?.message || 'Something went wrong.';
      setErrorMessage(typeof message === 'string' ? message : message[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full min-h-[60px] max-h-[200px] resize-none border-0 outline-none placeholder-gray-500 text-sm leading-5"
        disabled={isLoading}
      />

      {/* ✅ Inline Error Message */}
      {errorMessage && (
        <div className="text-xs text-red-500 mt-1">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">
          {content.length > 0 && `${content.length} characters`}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!content.trim() || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            {submitLabel}
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-400 mt-1">
        Press Cmd+Enter to submit, Esc to cancel
      </div>
    </form>
  );
};
