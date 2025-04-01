"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Swal from "sweetalert2";
import { GoogleIcon } from "@/components/icons";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { firebase_app } from "@/lib/firebase";
import ReCAPTCHA from "react-google-recaptcha";

interface LoginModalProps {
  onComplete: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isFromLogin?: boolean;
}

// Constante para definir el tiempo de espera (10 minutos en milisegundos)
const LOGIN_MODAL_COOLDOWN = 10 * 60 * 1000; // 10 minutos
const LOGIN_MODAL_STORAGE_KEY = "loginModalLastClosed";

export function UserNameModal({
  onComplete,
  isOpen,
  onClose,
  isFromLogin = false,
}: LoginModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(true);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("login");

  const auth = getAuth(firebase_app);

  // Crear una nueva instancia del proveedor para evitar problemas de estado
  const googleProvider = new GoogleAuthProvider();

  // Función para verificar si el modal debería mostrarse o está en período de enfriamiento
  const shouldShowLoginModal = () => {
    // Obtener el timestamp de la última vez que se cerró el modal
    const lastClosed = localStorage.getItem(LOGIN_MODAL_STORAGE_KEY);

    if (!lastClosed) {
      return true; // Si nunca se ha cerrado, mostrar el modal
    }

    const now = Date.now();
    const lastClosedTime = parseInt(lastClosed, 10);

    // Si ha pasado más tiempo que el período de enfriamiento, mostrar el modal
    return now - lastClosedTime > LOGIN_MODAL_COOLDOWN;
  };

  // Efecto para manejar el resultado de la redirección después del inicio de sesión
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;

          // Guardar información del usuario
          localStorage.setItem("userName", user.displayName || "Usuario");
          localStorage.setItem("userEmail", user.email || "");
          localStorage.setItem("userPhoto", user.photoURL || "");

          Swal.fire({
            title: "¡Bienvenido!",
            text: "Inicio de sesión exitoso",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });

          setOpen(false);
          if (onClose) onClose();
          onComplete();
        }
      } catch (error: any) {
        console.error("Error en redirección de autenticación:", error);
        handleAuthError(error);
      }
    };

    checkRedirectResult();
  }, [auth, onComplete, onClose]);

  // Efecto para manejar el estado isOpen proporcionado desde el exterior
  useEffect(() => {
    if (isOpen !== undefined) {
      // Si se está tratando de abrir el modal, verificar el período de enfriamiento
      if (isOpen && !shouldShowLoginModal() && !isFromLogin) {
        // Estamos en período de enfriamiento, notificar al componente padre
        if (onClose) onClose();
        return;
      }
      setOpen(isOpen);
    }
  }, [isOpen, onClose]);

  // Efecto para la autenticación automática al inicio
  useEffect(() => {
    // Solo verificar auto-login si no se está controlando explícitamente el modal
    if (isOpen === undefined) {
      // Check if user is already logged in
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          // User is signed in
          localStorage.setItem("userName", user.displayName || "Usuario");
          localStorage.setItem("userEmail", user.email || "");
          localStorage.setItem("userPhoto", user.photoURL || "");
          onComplete();
        } else {
          // No user is signed in, verificar si debemos mostrar el modal o está en enfriamiento
          if (shouldShowLoginModal()) {
            setOpen(true);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [auth, onComplete, isOpen]);

  // Función centralizada para manejar errores de autenticación
  const handleAuthError = (error: any) => {
    console.error("Error de autenticación:", error);
    setLoginError(null);

    if (error.code === "auth/popup-closed-by-user") {
      Swal.fire({
        title: "Inicio de sesión cancelado",
        text: "La ventana de inicio de sesión fue cerrada",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
    } else if (error.code === "auth/cancelled-popup-request") {
      Swal.fire({
        title: "Solicitud cancelada",
        text: "La solicitud de inicio de sesión fue cancelada",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
    } else if (error.code === "auth/popup-blocked") {
      Swal.fire({
        title: "Ventana bloqueada",
        text: "El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
    } else if (error.code === "auth/invalid-credential") {
      setLoginError("Credenciales inválidas. Verifica el correo y contraseña.");
    } else if (error.code === "auth/invalid-email") {
      setLoginError("El formato del correo electrónico no es válido.");
    } else if (error.code === "auth/user-not-found") {
      setLoginError("No existe ninguna cuenta con este correo electrónico.");
    } else if (error.code === "auth/wrong-password") {
      setLoginError("Contraseña incorrecta. Inténtalo de nuevo.");
    } else if (error.code === "auth/weak-password") {
      setLoginError("La contraseña debe tener al menos 6 caracteres.");
    } else if (error.code === "auth/email-already-in-use") {
      setLoginError("Este correo electrónico ya está en uso.");
    } else {
      setLoginError(error.message || "Error durante el inicio de sesión.");
    }
  };

  // Función personalizada para manejar el cambio de estado del diálogo
  const handleOpenChange = (newOpenState: boolean) => {
    setOpen(newOpenState);

    // Si se está cerrando el modal sin iniciar sesión, registrar el timestamp
    if (!newOpenState) {
      const now = Date.now();
      localStorage.setItem(LOGIN_MODAL_STORAGE_KEY, now.toString());

      if (onClose) {
        onClose();
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (!verified) {
      Swal.fire({
        title: "Error de verificación",
        text: "Por favor completa el reCAPTCHA primero",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      setLoading(true);
      setLoginError(null);
      console.log("Iniciando autenticación con Google...");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("Usuario autenticado:", user.displayName);

      // Save user info to localStorage
      localStorage.setItem("userName", user.displayName || "Usuario");
      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("userPhoto", user.photoURL || "");

      Swal.fire({
        title: "¡Bienvenido!",
        text: "Inicio de sesión exitoso",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setOpen(false);
      if (onClose) onClose();
      onComplete();
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verified) {
      Swal.fire({
        title: "Error de verificación",
        text: "Por favor completa el reCAPTCHA primero",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      setLoading(true);
      setLoginError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Save user info to localStorage
      localStorage.setItem("userName", user.displayName || "Usuario");
      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("userPhoto", user.photoURL || "");

      Swal.fire({
        title: "¡Bienvenido!",
        text: "Inicio de sesión exitoso",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setOpen(false);
      if (onClose) onClose();
      onComplete();
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verified) {
      Swal.fire({
        title: "Error de verificación",
        text: "Por favor completa el reCAPTCHA primero",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!displayName.trim()) {
      setLoginError("Por favor ingresa tu nombre.");
      return;
    }

    try {
      setLoading(true);
      setLoginError(null);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = result.user;

      // Actualizar el perfil con el nombre ingresado
      await updateProfile(user, {
        displayName: displayName,
      });

      // Save user info to localStorage
      localStorage.setItem("userName", displayName);
      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("userPhoto", user.photoURL || "");

      // Enviar correo de verificación
      await sendEmailVerification(user);

      Swal.fire({
        title: "¡Cuenta creada!",
        html: `Tu cuenta ha sido creada con éxito.<br><br>
              <strong>IMPORTANTE:</strong> Se ha enviado un correo de verificación a ${user.email}.<br>
              Por favor, revisa tu bandeja de entrada (y carpeta de spam) y haz clic en el enlace para verificar tu correo.<br><br>
              Necesitas verificar tu correo para poder publicar objetos, comentar y dar me gusta.`,
        icon: "success",
        confirmButtonText: "Entendido",
      });

      setOpen(false);
      if (onClose) onClose();
      onComplete();
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bienvenido a PerdidosYa!</DialogTitle>
          <DialogDescription>
            Inicia sesión o regístrate para publicar objetos o comentar.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="login"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
            <TabsTrigger value="signup">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O continuar con
                </span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              disabled={loading || !verified}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <GoogleIcon className="h-5 w-5" />
              Google
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nombre</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Tu nombre"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Correo electrónico</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Contraseña</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O continuar con
                </span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              disabled={loading || !verified}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <GoogleIcon className="h-5 w-5" />
              Google
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <p className="text-xs text-muted-foreground">
            Al iniciar sesión, aceptas los términos y condiciones de PerdidosYa!
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
