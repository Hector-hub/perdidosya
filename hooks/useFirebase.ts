"use client";

import { useState, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  where,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import type { Item, Comment, UserProfile } from "../types";
import { sendCommentNotifications } from "@/lib/email-service";
import { toast } from "react-hot-toast";

const useFirebase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastVisibleDoc, setLastVisibleDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreItems, setHasMoreItems] = useState(true);

  // Verificar si el usuario ha alcanzado el límite de publicaciones diarias (3)
  const checkDailyPostLimit = useCallback(async (userId: string) => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startTimestamp = Timestamp.fromDate(startOfDay);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const endTimestamp = Timestamp.fromDate(endOfDay);

      const itemsRef = collection(db, "items");
      const q = query(
        itemsRef,
        where("authorId", "==", userId),
        where("createdAt", ">=", startTimestamp),
        where("createdAt", "<=", endTimestamp)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size < 3; // devuelve true si el usuario tiene menos de 3 publicaciones hoy
    } catch (error) {
      console.error("Error al verificar límite diario:", error);
      return false; // en caso de error, no permitir más publicaciones
    }
  }, []);

  // Add or update a lost item
  const addOrUpdateItem = useCallback(
    async (itemData: Partial<Item>, imageFile?: File) => {
      setLoading(true);
      setError(null);

      try {
        // Verificar si el usuario está autenticado
        if (!auth.currentUser) {
          toast.error("Debes iniciar sesión para publicar un objeto");
          return null;
        }

        // Verificar si el correo está verificado
        if (!auth.currentUser.emailVerified) {
          toast.error(
            "Debes verificar tu correo electrónico para publicar un objeto"
          );
          return null;
        }

        // Si es una actualización (ya tiene ID), no verificamos límite
        // Si es una nueva publicación, verificamos el límite diario
        if (!itemData.id && auth.currentUser) {
          const canPost = await checkDailyPostLimit(auth.currentUser.uid);
          if (!canPost) {
            toast.error("Has alcanzado el límite de 3 publicaciones por día");
            return null;
          }
        }

        const docRef = itemData.id
          ? doc(db, "items", itemData.id.toString())
          : doc(collection(db, "items"));
        const id = docRef.id;

        let imageUrl = itemData.imageUrl;

        // Upload new image if provided
        if (imageFile) {
          const imageRef = ref(storage, `items/${id}/image`);
          await uploadBytes(imageRef, imageFile);
          imageUrl = await getDownloadURL(imageRef);
        }

        // Asegurarse de que authorEmail y authorPhotoURL sean null y no undefined
        if (itemData.authorEmail === undefined) {
          itemData.authorEmail = null;
        }
        if (itemData.authorPhotoURL === undefined) {
          itemData.authorPhotoURL = null;
        }

        // Construct the document to save
        const docToSave = {
          ...itemData,
          id,
          ...(imageUrl && { imageUrl }),
          createdAt: itemData.createdAt || Timestamp.now(),
          updatedAt: Timestamp.now(),
          likes: itemData.likes || [],
          comments: itemData.comments || [],
        };

        // Add or update the document
        await setDoc(docRef, docToSave, { merge: true });
        return docToSave;
      } catch (e) {
        console.error("Error adding/updating item: ", e);
        setError("Error adding/updating item");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [checkDailyPostLimit]
  );

  // Get items with paging support
  const getItems = useCallback(async (itemsPerPage: number = 12) => {
    setLoading(true);
    setError(null);

    try {
      const itemsRef = collection(db, "items");
      const q = query(
        itemsRef,
        orderBy("createdAt", "desc"),
        limit(itemsPerPage)
      );

      const querySnapshot = await getDocs(q);

      // Si no hay documentos, no hay más items para cargar
      if (querySnapshot.empty) {
        setHasMoreItems(false);
        return [];
      }

      // Guardar el último documento visible para la próxima carga
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisibleDoc(lastVisible);

      // Verificar si hay más items para cargar
      setHasMoreItems(querySnapshot.docs.length === itemsPerPage);

      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return items as Item[];
    } catch (e) {
      console.error("Error getting items: ", e);
      setError("Error getting items");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more items (for infinite scroll)
  const loadMoreItems = useCallback(
    async (itemsPerPage: number = 12) => {
      if (!lastVisibleDoc || !hasMoreItems) {
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        const itemsRef = collection(db, "items");
        const q = query(
          itemsRef,
          orderBy("createdAt", "desc"),
          startAfter(lastVisibleDoc),
          limit(itemsPerPage)
        );

        const querySnapshot = await getDocs(q);

        // Si no hay documentos, no hay más items para cargar
        if (querySnapshot.empty) {
          setHasMoreItems(false);
          return [];
        }

        // Guardar el último documento visible para la próxima carga
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisibleDoc(lastVisible);

        // Verificar si hay más items para cargar
        setHasMoreItems(querySnapshot.docs.length === itemsPerPage);

        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        return items as Item[];
      } catch (e) {
        console.error("Error loading more items: ", e);
        setError("Error loading more items");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [lastVisibleDoc, hasMoreItems]
  );

  // Reset pagination state
  const resetPagination = useCallback(() => {
    setLastVisibleDoc(null);
    setHasMoreItems(true);
  }, []);

  // Get single item by ID
  const getItemById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, "items", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Item;
      } else {
        console.error("No such document!");
        setError("No such document");
        return null;
      }
    } catch (e) {
      console.error("Error getting item: ", e);
      setError("Error getting item");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete an item
  const deleteItemById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      // Verificar si el usuario está autenticado
      if (!auth.currentUser) {
        toast.error("Debes iniciar sesión para eliminar objetos");
        return false;
      }

      // Verificar si el correo está verificado
      if (!auth.currentUser.emailVerified) {
        toast.error(
          "Debes verificar tu correo electrónico para eliminar objetos"
        );
        return false;
      }

      const docRef = doc(db, "items", id);

      // Get the document to retrieve the URLs of the files to delete
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const itemData = docSnap.data() as Item;

        // Verificar que el usuario sea el propietario o un administrador
        if (
          auth.currentUser.uid !== itemData.authorId &&
          !(auth.currentUser as any).isAdmin
        ) {
          toast.error("No tienes permiso para eliminar este objeto");
          return false;
        }

        // Delete image from storage if exists
        if (itemData.imageUrl) {
          const imageRef = ref(storage, `items/${id}/image`);
          await deleteObject(imageRef);
        }

        // Delete the document from Firestore
        await deleteDoc(docRef);
        return true;
      } else {
        console.error("No such document!");
        setError("No such document");
        return false;
      }
    } catch (e) {
      console.error("Error deleting item: ", e);
      setError("Error deleting item");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a comment to an item
  const addComment = useCallback(
    async (itemId: string, comment: Partial<Comment>) => {
      setLoading(true);
      setError(null);

      try {
        // Verificar si el usuario está autenticado
        if (!auth.currentUser) {
          toast.error("Debes iniciar sesión para comentar");
          return null;
        }

        // Verificar si el correo está verificado
        if (!auth.currentUser.emailVerified) {
          toast.error("Debes verificar tu correo electrónico para comentar");
          return null;
        }

        const docRef = doc(db, "items", itemId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const itemData = docSnap.data() as Item;

          // Verificar si el usuario ha alcanzado el límite de 3 comentarios en esta publicación
          if (comment.authorId && auth.currentUser) {
            const userComments = (itemData.comments || []).filter(
              (c) => c.authorId === auth.currentUser?.uid
            );

            if (userComments.length >= 3) {
              toast.error(
                "Has alcanzado el límite de 3 comentarios por publicación"
              );
              setLoading(false);
              return null;
            }
          }

          // Asegurarse de que el comentario incluya el email del autor si está disponible
          if (comment.authorId && auth.currentUser && auth.currentUser.email) {
            comment.authorEmail = auth.currentUser.email;
          } else {
            comment.authorEmail = null;
          }

          // Asegurarse de que authorPhotoURL sea null y no undefined
          if (comment.authorPhotoURL === undefined) {
            comment.authorPhotoURL = null;
          }

          const commentData = {
            ...comment,
            id: crypto.randomUUID(),
            createdAt: Timestamp.now(),
          };

          await updateDoc(docRef, {
            comments: arrayUnion(commentData),
          });

          // Enviar notificaciones por correo electrónico
          try {
            // Obtener el item actualizado para asegurarnos de tener todos los comentarios
            const updatedDocSnap = await getDoc(docRef);
            if (updatedDocSnap.exists()) {
              const updatedItemData = updatedDocSnap.data() as Item;
              const updatedItem: Item = {
                ...updatedItemData,
                id: itemId,
              };

              await sendCommentNotifications(
                updatedItem,
                commentData as Comment,
                [commentData.authorId || ""]
              );
            }
          } catch (emailError) {
            console.error(
              "Error al enviar notificaciones por correo:",
              emailError
            );
            // Continuamos aunque falle el envío de correos
          }

          return commentData;
        } else {
          setError("Item not found");
          return null;
        }
      } catch (e) {
        console.error("Error adding comment: ", e);
        setError("Error adding comment");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete a comment from an item
  const deleteComment = useCallback(
    async (itemId: string, commentId: string) => {
      setLoading(true);
      setError(null);

      try {
        // Verificar si el usuario está autenticado
        if (!auth.currentUser) {
          toast.error("Debes iniciar sesión para eliminar comentarios");
          return false;
        }

        // Verificar si el correo está verificado
        if (!auth.currentUser.emailVerified) {
          toast.error(
            "Debes verificar tu correo electrónico para eliminar comentarios"
          );
          return false;
        }

        const docRef = doc(db, "items", itemId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const itemData = docSnap.data() as Item;
          const comments = itemData.comments || [];
          const commentToDelete = comments.find(
            (comment) => comment.id === commentId
          );

          if (commentToDelete) {
            await updateDoc(docRef, {
              comments: arrayRemove(commentToDelete),
            });
            return true;
          } else {
            setError("Comment not found");
            return false;
          }
        } else {
          setError("Item not found");
          return false;
        }
      } catch (e) {
        console.error("Error deleting comment: ", e);
        setError("Error deleting comment");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Toggle like on an item
  const toggleLike = useCallback(async (itemId: string, userId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Verificar si el usuario está autenticado
      if (!auth.currentUser) {
        toast.error("Debes iniciar sesión para dar 'me gusta'");
        return null;
      }

      // Verificar si el correo está verificado
      if (!auth.currentUser.emailVerified) {
        toast.error(
          "Debes verificar tu correo electrónico para dar 'me gusta'"
        );
        return null;
      }

      const docRef = doc(db, "items", itemId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const itemData = docSnap.data() as Item;
        const likes = itemData.likes || [];

        if (likes.includes(userId)) {
          await updateDoc(docRef, {
            likes: arrayRemove(userId),
          });
          return false; // Unliked
        } else {
          await updateDoc(docRef, {
            likes: arrayUnion(userId),
          });
          return true; // Liked
        }
      } else {
        setError("Item not found");
        return null;
      }
    } catch (e) {
      console.error("Error toggling like: ", e);
      setError("Error toggling like");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search items by term
  const searchItems = useCallback(async (searchTerm: string) => {
    setLoading(true);
    setError(null);

    try {
      const itemsRef = collection(db, "items");
      const q = query(itemsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const items = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Item))
        .filter((item) => {
          const name = item.name?.toLowerCase() || "";
          const description = item.description?.toLowerCase() || "";
          const search = searchTerm.toLowerCase();
          return name.includes(search) || description.includes(search);
        });

      return items;
    } catch (e) {
      console.error("Error searching items: ", e);
      setError("Error searching items");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    hasMoreItems,
    addOrUpdateItem,
    getItems,
    loadMoreItems,
    resetPagination,
    getItemById,
    deleteItemById,
    addComment,
    deleteComment,
    toggleLike,
    searchItems,
  };
};

export default useFirebase;
