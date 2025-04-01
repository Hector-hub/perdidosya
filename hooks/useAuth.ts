"use client";

import { useState, useEffect, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
  User,
  UserCredential,
  GoogleAuthProvider,
  getRedirectResult,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { toast } from "react-hot-toast";

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  useEffect(() => {
    // Check for redirect result on load
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("Redirect authentication successful:", result.user);
        }
      } catch (err: any) {
        console.error("Redirect authentication error:", err);
        setError(err.message);
      }
    };

    checkRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        // Verificar si el correo está verificado
        setIsEmailVerified(currentUser.emailVerified);

        // Check if user profile exists in Firestore
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // Create user profile if it doesn't exist
          await setDoc(userRef, {
            id: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || "",
            photoURL: currentUser.photoURL || "",
            createdAt: Timestamp.now(),
          });
        }

        setUser(currentUser);
      } else {
        setUser(null);
        setIsEmailVerified(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Función para enviar correo de verificación
  const sendVerificationEmail = useCallback(async (): Promise<boolean> => {
    if (!auth.currentUser) {
      toast.error("No hay ningún usuario autenticado");
      return false;
    }

    try {
      await sendEmailVerification(auth.currentUser);
      toast.success(
        "Correo de verificación enviado. Por favor revisa tu bandeja de entrada."
      );
      return true;
    } catch (error: any) {
      console.error("Error al enviar correo de verificación:", error);
      toast.error(`Error al enviar correo de verificación: ${error.message}`);
      return false;
    }
  }, []);

  // Función para recargar el usuario y verificar si el correo ha sido verificado
  const checkEmailVerification = useCallback(async (): Promise<boolean> => {
    if (!auth.currentUser) {
      return false;
    }

    try {
      await auth.currentUser.reload();
      const verified = auth.currentUser.emailVerified;
      setIsEmailVerified(verified);
      return verified;
    } catch (error) {
      console.error("Error al verificar el estado del correo:", error);
      return false;
    }
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      displayName?: string
    ): Promise<User | null> => {
      setLoading(true);
      setError(null);
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Set display name if provided
        if (displayName && auth.currentUser) {
          await updateProfile(auth.currentUser, {
            displayName,
          });
        }

        // Enviar correo de verificación automáticamente al registrarse
        if (auth.currentUser) {
          await sendEmailVerification(auth.currentUser);
          toast.success(
            "Se ha enviado un correo de verificación a tu dirección de correo electrónico."
          );
        }

        return userCredential.user;
      } catch (e: any) {
        setError(e.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string): Promise<User | null> => {
      setLoading(true);
      setError(null);
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Verificar si el correo está verificado
        if (!userCredential.user.emailVerified) {
          toast.error(
            "Tu correo electrónico no ha sido verificado. Por favor, verifica tu correo para acceder a todas las funcionalidades."
          );
        }

        return userCredential.user;
      } catch (e: any) {
        setError(e.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loginWithGoogle = useCallback(async (): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    isEmailVerified,
    register,
    login,
    loginWithGoogle,
    logout,
    sendVerificationEmail,
    checkEmailVerification,
  };
};

export default useAuth;
