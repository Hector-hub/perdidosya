"use client";

import React from "react";
import CommentItem from "../molecules/CommentItem";
import CommentForm from "../molecules/CommentForm";
import useFirebase from "../../hooks/useFirebase";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import { Comment } from "../../types";

// Use more generic typing to avoid TypeScript issues
interface CommentsListProps {
  itemId: string;
  comments: readonly {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    createdAt: any;
  }[];
  refetchItem?: () => void;
}

const CommentsList: React.FC<CommentsListProps> = ({
  itemId,
  comments = [],
  refetchItem,
}) => {
  const { user } = useAuth();
  const { addComment, deleteComment, loading } = useFirebase();

  // Contar cuántos comentarios ha hecho el usuario actual en esta publicación
  const userCommentCount = user
    ? comments.filter((comment) => comment.authorId === user.uid).length
    : 0;

  // Comprobar si el usuario ha alcanzado el límite de comentarios
  const hasReachedCommentLimit = userCommentCount >= 3;

  const handleAddComment = async (commentData: Partial<Comment>) => {
    if (!user) {
      toast.error("Debes iniciar sesión para comentar");
      return;
    }

    if (hasReachedCommentLimit) {
      toast.error("Has alcanzado el límite de 3 comentarios por publicación");
      return;
    }

    try {
      await addComment(itemId, commentData);
      toast.success("Comentario agregado");
      if (refetchItem) refetchItem();
    } catch (error) {
      console.error("Error al agregar comentario:", error);
      toast.error("Ocurrió un error al agregar comentario");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(itemId, commentId);
      toast.success("Comentario eliminado");
      if (refetchItem) refetchItem();
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      toast.error("Ocurrió un error al eliminar comentario");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Comentarios ({comments.length})
        </h3>
        {user && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Has realizado {userCommentCount} de 3 comentarios permitidos en esta
            publicación.
          </p>
        )}
      </div>

      <div className="p-4">
        {hasReachedCommentLimit && user ? (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-800 mb-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Has alcanzado el límite de 3 comentarios en esta publicación.
            </p>
          </div>
        ) : (
          <CommentForm
            currentUser={user}
            onAddComment={handleAddComment}
            loading={loading}
          />
        )}
      </div>

      <div className="px-4 pb-4">
        {comments.length > 0 ? (
          <div className="space-y-2">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment as Comment}
                currentUser={user}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">
            No hay comentarios aún. ¡Sé el primero en comentar!
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentsList;
