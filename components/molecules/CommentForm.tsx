"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import Avatar from "../atoms/Avatar";
import Button from "../atoms/Button";
import { User } from "firebase/auth";
import { Comment } from "../../types";

interface CommentFormProps {
  currentUser: User | null;
  onAddComment: (commentData: Partial<Comment>) => void;
  loading?: boolean;
}

const CommentForm = ({
  currentUser,
  onAddComment,
  loading = false,
}: CommentFormProps) => {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (commentText.trim() && currentUser) {
      onAddComment({
        text: commentText.trim(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName || "Usuario",
        authorPhotoURL: currentUser.photoURL || null,
        authorEmail: currentUser.email || null,
      });
      setCommentText("");
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Inicia sesión para dejar un comentario
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3">
      <Avatar
        src={currentUser.photoURL || undefined}
        alt={currentUser.displayName || "Usuario"}
        size="sm"
      />

      <div className="flex-1 relative">
        <textarea
          value={commentText}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setCommentText(e.target.value)
          }
          placeholder="Escribe un comentario..."
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 min-h-[60px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={!commentText.trim() || loading}
          className="absolute bottom-2 right-2"
          size="sm"
        >
          Publicar
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
