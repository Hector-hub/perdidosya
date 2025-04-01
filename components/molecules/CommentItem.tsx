"use client";

import React from "react";
import Avatar from "../atoms/Avatar";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Button from "../atoms/Button";
import { FaTrash } from "react-icons/fa";
import { Comment } from "../../types";
import { User } from "firebase/auth";

interface CommentItemProps {
  comment: Comment;
  currentUser: User | null;
  onDelete: (commentId: string) => void;
}

const CommentItem = ({ comment, currentUser, onDelete }: CommentItemProps) => {
  const { id, text, authorId, authorName, authorPhotoURL, createdAt } = comment;

  const formattedDate = formatDistanceToNow(createdAt.toDate(), {
    addSuffix: true,
    locale: es,
  });

  const canDelete =
    currentUser &&
    (currentUser.uid === authorId || (currentUser as any).isAdmin);

  return (
    <div className="flex gap-3 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <Avatar src={authorPhotoURL} alt={authorName} size="sm" />

      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
            <div className="flex items-baseline justify-between mb-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {authorName}
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{text}</p>
          </div>

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(id)}
              className="text-red-500 hover:text-red-600 ml-2"
            >
              <FaTrash size={14} />
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formattedDate}
        </p>
      </div>
    </div>
  );
};

export default CommentItem;
