"use client";

import React from "react";
import CommentItem from "../molecules/CommentItem";
import CommentForm from "../molecules/CommentForm";
import useFirebase from "../../hooks/useFirebase";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

const CommentsList = ({ itemId, comments = [], refetchItem }) => {
  const { user } = useAuth();
  const { addComment, deleteComment, loading } = useFirebase();

  const handleAddComment = async (commentData) => {
    if (!user) {
      toast.error("Debes iniciar sesión para comentar");
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

  const handleDeleteComment = async (commentId) => {
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
      </div>

      <div className="p-4">
        <CommentForm
          currentUser={user}
          onAddComment={handleAddComment}
          loading={loading}
        />
      </div>

      <div className="px-4 pb-4">
        {comments.length > 0 ? (
          <div className="space-y-2">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
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
