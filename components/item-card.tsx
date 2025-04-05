"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  MapPin,
  Calendar,
  Share2,
  Heart,
  Trash2,
  Link,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Item, Comment } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Timestamp } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getAuth } from "firebase/auth";
import { firebase_app } from "@/lib/firebase";
import Swal from "sweetalert2";
import { ContentModerationService } from "@/services/moderation";

interface ItemCardProps {
  item: Item;
  onAddComment: (itemId: string, comment: Comment) => void;
  onLike?: (itemId: string) => void;
  onShare?: (item: Item) => void;
  onDeleteComment?: (itemId: string, commentId: string) => void;
  onDeleteItem?: (itemId: string) => void;
  currentUser?: any;
  isDetails?: boolean;
}

export function ItemCard({
  item,
  onAddComment,
  onLike,
  onShare,
  onDeleteComment,
  onDeleteItem,
  currentUser: propCurrentUser,
  isDetails = false,
}: ItemCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(propCurrentUser || null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes?.length || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = getAuth(firebase_app);

  useEffect(() => {
    // Get current user if not provided through props
    if (!propCurrentUser) {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          setCurrentUser(user);
          // Check if user has liked this item
          setIsLiked(item.likes?.includes(user.uid) || false);
        }
      });
      return () => unsubscribe();
    } else {
      // If user is provided through props, use it
      setCurrentUser(propCurrentUser);
      setIsLiked(item.likes?.includes(propCurrentUser.uid) || false);
    }
  }, [auth, item.likes, propCurrentUser]);

  const toggleComments = () => setShowComments(!showComments);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      Swal.fire({
        title: "Inicio de sesión requerido",
        text: "Por favor inicia sesión para comentar",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // Verificar si el correo está verificado
    if (!currentUser.emailVerified) {
      Swal.fire({
        title: "Verificación requerida",
        html: `Debes verificar tu correo electrónico para comentar.<br><br>
              Te invitamos a verificar tu correo para acceder a todas las funcionalidades.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ir a mi perfil",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/perfil";
        }
      });
      return;
    }

    if (!newComment.trim()) {
      Swal.fire({
        title: "Error",
        text: "El comentario no puede estar vacío",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Validar contenido del comentario
      const moderationService = ContentModerationService.getInstance();
      const commentValidation = await moderationService.validateContent(
        newComment
      );

      if (!commentValidation.isValid) {
        Swal.fire({
          title: "Contenido inapropiado",
          text:
            commentValidation.message ||
            "El comentario contiene contenido inapropiado",
          icon: "error",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      const comment: Comment = {
        id: Math.random().toString(36).substring(2, 9),
        text: newComment,
        authorId: currentUser.uid,
        authorName: isAnonymous
          ? "Anónimo"
          : currentUser.displayName || "Usuario",
        authorPhotoURL: isAnonymous ? null : currentUser.photoURL || null,
        authorEmail: isAnonymous ? null : currentUser.email || null,
        isAnonymous: isAnonymous,
        createdAt: Timestamp.now(),
      };

      // Call the provided onAddComment function
      await onAddComment(item.id, comment);

      // Clear the input field after successful submission
      setNewComment("");
      Swal.fire({
        title: "¡Éxito!",
        text: "Comentario añadido con éxito",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al añadir comentario:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo añadir el comentario. Inténtalo de nuevo.",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = () => {
    if (!currentUser) {
      Swal.fire({
        title: "Inicio de sesión requerido",
        text: "Por favor inicia sesión para dar like",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // Verificar si el correo está verificado
    if (!currentUser.emailVerified) {
      Swal.fire({
        title: "Verificación requerida",
        html: `Debes verificar tu correo electrónico para dar me gusta.<br><br>
              Te invitamos a verificar tu correo para acceder a todas las funcionalidades.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ir a mi perfil",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/perfil";
        }
      });
      return;
    }

    // Optimistic UI update
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    // Call the provided onLike function if available
    if (onLike) {
      onLike(item.id);
    }
  };

  const handleShare = () => {
    // Create a shareable URL
    const shareUrl = `${window.location.origin}/items?id=${item.id}`;

    // Check if Web Share API is available
    if (navigator.share) {
      navigator
        .share({
          title: `${item.name} - PerdidosYa!`,
          text: item.description,
          url: shareUrl,
        })
        .then(() =>
          Swal.fire({
            title: "¡Compartido!",
            text: "¡Compartido con éxito!",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          })
        )
        .catch((error) => {
          console.log("copiado cancelado");
          fallbackShare(shareUrl);
        });
    } else {
      fallbackShare(shareUrl);
    }

    // Call the provided onShare function if available
    if (onShare) {
      onShare(item);
    }
  };

  const fallbackShare = (url: string) => {
    // Fallback for browsers that don't support the Web Share API
    navigator.clipboard
      .writeText(url)
      .then(() =>
        Swal.fire({
          title: "URL copiada",
          text: "URL copiada al portapapeles",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        })
      )
      .catch(() => {
        console.log("copiado cancelado");
      });
  };

  const formatDate = (date: any) => {
    if (!date) return "Fecha desconocida";
    const timestamp = date instanceof Date ? date : date.toDate();
    return formatDistanceToNow(timestamp, { addSuffix: true, locale: es });
  };

  // Usar el campo type del item si está disponible, o inferirlo del texto si no lo está
  const itemType = item.type
    ? item.type
    : item.description?.toLowerCase().includes("encontré") ||
      item?.name?.toLowerCase().includes("encontré")
    ? "encontrado"
    : "perdido";

  // Function to check if the user can delete a comment
  const canDeleteComment = (comment: Comment) => {
    if (!currentUser) return false;
    // El usuario puede eliminar un comentario si es suyo (aunque sea anónimo)
    return comment.authorId === currentUser.uid;
  };

  // Function to handle comment deletion
  const handleDeleteComment = (commentId: string) => {
    if (!currentUser) {
      Swal.fire({
        title: "Inicio de sesión requerido",
        text: "Por favor inicia sesión para eliminar comentarios",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!onDeleteComment) {
      Swal.fire({
        title: "Error",
        text: "Error: función de eliminación no disponible",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // Confirmar antes de eliminar
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Quieres eliminar este comentario?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteComment(item.id, commentId);
      }
    });
  };

  // Function to handle item deletion
  const handleDeleteItem = () => {
    if (!currentUser || !onDeleteItem) {
      return;
    }

    onDeleteItem(item.id);
  };

  return (
    <Card className="overflow-hidden">
      <a href={isDetails ? undefined : `/items?id=${item.id}`} key={item.id}>
        <div className="relative h-48">
          <Image
            src={item.imageUrl || "/placeholder.svg"}
            alt={
              item.name
                ? `Imagen de ${item.name}`
                : "Imagen del objeto perdido o encontrado"
            }
            fill
            className="object-cover"
          />
          <Badge
            className="absolute top-2 right-2"
            variant={itemType === "perdido" ? "destructive" : "default"}
          >
            {itemType === "perdido" ? "Perdido" : "Encontrado"}
          </Badge>

          {onDeleteItem && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 left-2"
              onClick={handleDeleteItem}
              title="Eliminar publicación"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <CardHeader className="pb-2">
          <CardTitle>{item.name}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(item.createdAt)}
          </CardDescription>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {item.location || "Ubicación desconocida"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p
            className={`text-sm text-gray-600 dark:text-gray-300 ${
              isDetails ? "" : "line-clamp-3"
            }`}
          >
            {item.description}
          </p>
        </CardContent>
      </a>
      <CardFooter className="flex flex-col gap-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={
                  item.isAnonymous
                    ? "/placeholder-user.jpg"
                    : item.authorPhotoURL || "/placeholder-user.jpg"
                }
                alt={
                  item.authorName
                    ? `Foto de perfil de ${item.authorName}`
                    : "Foto de perfil del usuario"
                }
              />
              <AvatarFallback>{item?.authorName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {item.isAnonymous ? "Anónimo" : item.authorName}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? "text-red-500" : ""}
            >
              <Heart
                className={`h-4 w-4 mr-1 ${isLiked ? "fill-red-500" : ""}`}
              />
              {likeCount}
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleComments}>
              <MessageCircle className="h-4 w-4 mr-1" />
              {item.comments?.length || 0}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="w-full border-t pt-4">
            <div className="space-y-3 max-h-40 overflow-y-auto mb-3">
              {item.comments && item.comments.length > 0 ? (
                item.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={comment.authorPhotoURL || "/placeholder-user.jpg"}
                        alt={`Foto de perfil de ${comment.authorName}`}
                      />
                      <AvatarFallback>
                        {comment.authorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-xs font-medium">
                          {comment.isAnonymous ? (
                            <span>
                              Anónimo
                              {canDeleteComment(comment) &&
                                comment.isAnonymous && (
                                  <span className="text-blue-500"> (Tú)</span>
                                )}
                            </span>
                          ) : (
                            comment.authorName
                          )}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                          {canDeleteComment(comment) && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-xs text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                              aria-label="Eliminar comentario"
                              title="Eliminar comentario"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs mt-1">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  No hay comentarios aún. Sé el primero en comentar.
                </p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex flex-col gap-2">
              <Textarea
                placeholder={
                  currentUser
                    ? "Añadir un comentario..."
                    : "Inicia sesión para comentar"
                }
                className="min-h-0 h-8 py-1 text-xs resize-none"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!currentUser || isSubmitting}
              />
              <div className="flex items-center justify-between">
                {currentUser && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`anonymous-${item.id}`}
                      checked={isAnonymous}
                      onCheckedChange={(checked) =>
                        setIsAnonymous(checked === true)
                      }
                      disabled={isSubmitting}
                    />
                    <Label htmlFor={`anonymous-${item.id}`} className="text-xs">
                      Comentar anónimamente
                    </Label>
                  </div>
                )}
                <Button
                  type="submit"
                  size="sm"
                  className="h-8"
                  disabled={!currentUser || isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
