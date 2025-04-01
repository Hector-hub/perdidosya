"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Avatar from "../atoms/Avatar";
import Button from "../atoms/Button";
import { FaHeart, FaRegHeart, FaComment, FaShare } from "react-icons/fa";
import Link from "next/link";
import { Item } from "../../types";
import { User } from "firebase/auth";
import useFirebase from "../../hooks/useFirebase";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

interface ItemCardProps {
  item: Item;
  currentUser?: User | null;
  onLike?: (itemId: string, userId: string) => void;
  onShare?: (url: string, title: string) => void;
  refetchItem?: () => void;
}

const ItemCard = ({
  item,
  currentUser,
  onLike,
  onShare,
  refetchItem,
}: ItemCardProps) => {
  const { toggleLike } = useFirebase();
  const { user } = useAuth();
  const actualUser = currentUser || user;

  const {
    id,
    name,
    description,
    imageUrl,
    authorName,
    isAnonymous,
    createdAt,
    likes = [],
    comments = [],
  } = item;

  const isLiked = actualUser ? likes?.includes(actualUser.uid) : false;
  const formattedDate = formatDistanceToNow(createdAt.toDate(), {
    addSuffix: true,
    locale: es,
  });

  const handleLike = async () => {
    if (!actualUser) {
      toast.error("Debes iniciar sesión para dar me gusta");
      return;
    }

    try {
      await toggleLike(id, actualUser.uid);
      if (refetchItem) refetchItem();
    } catch (error) {
      console.error("Error al dar me gusta:", error);
      toast.error("Ocurrió un error al dar me gusta");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/items?id=${id}`;

    if (onShare) {
      onShare(url, name);
    } else {
      if (navigator.share) {
        navigator
          .share({
            title: `PerdidosYa! - ${name}`,
            text: `Mira este objeto perdido: ${name}`,
            url: url,
          })
          .catch((error) => {
            console.error("Error al compartir:", error);
            copyToClipboard(url);
          });
      } else {
        copyToClipboard(url);
      }
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4">
      {/* Card Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar size="md" alt={isAnonymous ? "Anónimo" : authorName} />
          <div className="ml-3">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {isAnonymous ? "Anónimo" : authorName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formattedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Item Image */}
      <Link href={`/items?id=${id}`}>
        <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-700">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {/* Item Content */}
      <div className="p-4">
        <Link href={`/items?id=${id}`}>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {name}
          </h3>
        </Link>
        <p className="text-gray-700 dark:text-gray-300">{description}</p>
      </div>

      {/* Item Stats */}
      <div className="px-4 pb-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div>
          <span>{likes?.length || 0} Me gusta</span>
          <span className="mx-2">•</span>
          <span>{comments?.length || 0} Comentarios</span>
        </div>
      </div>

      {/* Item Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex justify-around">
        <Button
          variant="ghost"
          onClick={handleLike}
          disabled={!actualUser}
          className="flex items-center gap-2"
        >
          {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          <span>Me gusta</span>
        </Button>

        <Link href={`/items?id=${id}`}>
          <Button variant="ghost" className="flex items-center gap-2">
            <FaComment />
            <span>Comentar</span>
          </Button>
        </Link>

        <Button
          variant="ghost"
          onClick={handleShare}
          className="flex items-center gap-2"
        >
          <FaShare />
          <span>Compartir</span>
        </Button>
      </div>
    </div>
  );
};

export default ItemCard;
