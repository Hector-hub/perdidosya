"use client";

import React from "react";
import ItemCard from "../molecules/ItemCard";
import useFirebase from "../../hooks/useFirebase";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import { Item } from "../../types";

interface ItemsListProps {
  items: Item[];
  refetchItems?: () => void;
}

const ItemsList = ({ items, refetchItems }: ItemsListProps) => {
  const { toggleLike } = useFirebase();
  const { user } = useAuth();

  const handleLike = async (itemId: string, userId: string) => {
    if (!user) {
      toast.error("Debes iniciar sesión para dar me gusta");
      return;
    }

    try {
      await toggleLike(itemId, userId);
    } catch (error) {
      console.error("Error al dar me gusta:", error);
      toast.error("Ocurrió un error al dar me gusta");
    }

    if (refetchItems) {
      refetchItems();
    }
  };

  const handleShare = (url: string, itemName: string) => {
    if (navigator.share) {
      navigator
        .share({
          title: `PerdidosYa! - ${itemName}`,
          text: `Mira este objeto perdido: ${itemName}`,
          url: url,
        })
        .catch((error) => {
          console.error("Error al compartir:", error);
          // Fallback to copy to clipboard
          copyToClipboard(url);
        });
    } else {
      // Fallback for browsers that don't support Web Share API
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Enlace copiado al portapapeles");
      })
      .catch((err) => {
        console.error("Error al copiar:", err);
        toast.error("No se pudo copiar el enlace");
      });
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">
          No hay objetos perdidos para mostrar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          currentUser={user}
          onLike={handleLike}
          onShare={handleShare}
        />
      ))}
    </div>
  );
};

export default ItemsList;
