"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import useFirebase from "../../hooks/useFirebase";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";
import { Item, Comment } from "@/types";
import { ItemCard } from "@/components/item-card";
import { getAuth } from "firebase/auth";
import { firebase_app } from "@/lib/firebase";
import { Card } from "@/components/ui/card";

// Componente principal que usa useSearchParams
function ItemDetailContent() {
  const searchParams = useSearchParams();
  const itemId = searchParams.get("id");
  const { getItemById, toggleLike, addComment, deleteComment, deleteItemById } =
    useFirebase();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const auth = getAuth(firebase_app);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  const fetchItem = useCallback(async () => {
    if (!itemId) {
      setError("ID no proporcionado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedItem = await getItemById(itemId);
      setItem(fetchedItem || null);
      setError(fetchedItem ? null : "No se encontró el objeto");
    } catch (err) {
      console.error("Error al cargar el objeto:", err);
      setError("Ocurrió un error al cargar el objeto");
    } finally {
      setLoading(false);
    }
  }, [itemId, getItemById]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleLike = async (itemId: string) => {
    if (!currentUser) {
      Swal.fire({
        title: "Inicio de sesión requerido",
        text: "Por favor inicia sesión para dar like",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      // Actualización optimista
      setItem((prev) =>
        prev
          ? {
              ...prev,
              likes: prev.likes?.includes(currentUser.uid)
                ? prev.likes.filter((id) => id !== currentUser.uid)
                : [...(prev.likes || []), currentUser.uid],
            }
          : null
      );

      await toggleLike(itemId, currentUser.uid);
    } catch (error) {
      console.error("Error al dar like:", error);
      fetchItem(); // Recuperar estado original
      Swal.fire({
        title: "Error",
        text: "No se pudo dar like al objeto",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const handleAddComment = async (itemId: string, comment: Comment) => {
    try {
      // Actualización optimista
      setItem((prev) =>
        prev
          ? {
              ...prev,
              comments: [...(prev.comments || []), comment],
            }
          : null
      );

      await addComment(itemId, comment);
      Swal.fire({
        title: "¡Éxito!",
        text: "Comentario agregado",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al agregar comentario:", error);
      fetchItem();
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al agregar el comentario",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const handleDeleteComment = async (itemId: string, commentId: string) => {
    if (!currentUser) {
      Swal.fire({
        title: "Inicio de sesión requerido",
        text: "Por favor inicia sesión para eliminar comentarios",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      // Actualización optimista
      setItem((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments?.filter((c) => c.id !== commentId) || [],
            }
          : null
      );

      await deleteComment(itemId, commentId);
      Swal.fire({
        title: "¡Éxito!",
        text: "Comentario eliminado",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      fetchItem();
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al eliminar el comentario",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const handleShare = (item: Item) => {
    const url = `${window.location.origin}/items?id=${item.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: `PerdidosYa! - ${item.name}`,
          text: `Mira este objeto: ${item.name}`,
          url: url,
        })
        .catch(() => copyToClipboard(url));
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() =>
        Swal.fire({
          title: "Enlace copiado",
          text: "Enlace copiado al portapapeles",
          icon: "success",
          timer: 1500,
        })
      )
      .catch((err) => {
        console.error("Error al copiar:", err);
        Swal.fire({
          title: "Error",
          text: "No se pudo copiar el enlace",
          icon: "error",
        });
      });
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!currentUser) {
      Swal.fire({
        title: "Inicio de sesión requerido",
        text: "Por favor inicia sesión para eliminar publicaciones",
        icon: "warning",
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
    });

    if (result.isConfirmed) {
      try {
        await deleteItemById(itemId);
        Swal.fire({
          title: "¡Eliminado!",
          text: "Publicación eliminada correctamente",
          icon: "success",
          timer: 1500,
        });
        window.location.href = "/catalogo";
      } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar la publicación",
          icon: "error",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-10">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-10">
          <p className="text-red-500">{error || "No se encontró el objeto"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Card className="mb-6">
        <ItemCard
          item={item}
          onAddComment={handleAddComment}
          onLike={handleLike}
          onShare={handleShare}
          onDeleteComment={handleDeleteComment}
          onDeleteItem={
            item.authorId === currentUser?.uid ? handleDeleteItem : undefined
          }
          currentUser={currentUser}
          isDetails={true}
        />
      </Card>
    </div>
  );
}

// Componente contenedor con Suspense
export default function ItemDetail() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-10">
            <p className="text-gray-500">Cargando...</p>
          </div>
        </div>
      }
    >
      <ItemDetailContent />
    </Suspense>
  );
}
