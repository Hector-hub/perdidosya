"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Mail, RefreshCw } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { toast } from "react-hot-toast";

interface EmailVerificationProps {
  onVerified?: () => void;
}

export function EmailVerification({ onVerified }: EmailVerificationProps) {
  const {
    user,
    isEmailVerified,
    sendVerificationEmail,
    checkEmailVerification,
  } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Comprobar el estado de verificación periódicamente
  useEffect(() => {
    if (!user) return;

    const checkVerification = async () => {
      await checkEmailVerification();
      if (isEmailVerified && onVerified) {
        onVerified();
      }
    };

    checkVerification();

    // Comprobar cada 30 segundos
    const interval = setInterval(checkVerification, 30000);

    return () => clearInterval(interval);
  }, [user, checkEmailVerification, isEmailVerified, onVerified]);

  // Gestionar el contador de tiempo para reenvío
  useEffect(() => {
    if (!lastSent) return;

    const calculateCountdown = () => {
      const diff =
        60 - Math.floor((new Date().getTime() - lastSent.getTime()) / 1000);
      setCountdown(diff > 0 ? diff : 0);
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [lastSent]);

  const handleSendVerification = async () => {
    if (!user || isSending) return;

    setIsSending(true);
    try {
      const sent = await sendVerificationEmail();
      if (sent) {
        setLastSent(new Date());
        setCountdown(60);
      }
    } catch (error) {
      console.error("Error al enviar correo de verificación:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user || isChecking) return;

    setIsChecking(true);
    try {
      const verified = await checkEmailVerification();
      if (verified) {
        toast.success("¡Tu correo ha sido verificado correctamente!");
        if (onVerified) onVerified();
      } else {
        toast.error(
          "Tu correo aún no ha sido verificado. Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación."
        );
      }
    } catch (error) {
      console.error("Error al verificar estado del correo:", error);
    } finally {
      setIsChecking(false);
    }
  };

  if (!user) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Debes iniciar sesión para verificar tu correo electrónico.
        </AlertDescription>
      </Alert>
    );
  }

  if (isEmailVerified) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle>Correo verificado</AlertTitle>
        <AlertDescription>
          Tu correo electrónico ha sido verificado correctamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Verificación de correo electrónico</CardTitle>
        <CardDescription>
          Para acceder a todas las funcionalidades, necesitas verificar tu
          correo electrónico.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-amber-50 text-amber-800 border-amber-200">
          <Mail className="h-4 w-4" />
          <AlertTitle>Correo no verificado</AlertTitle>
          <AlertDescription>
            Hemos enviado un correo de verificación a{" "}
            <strong>{user.email}</strong>. Por favor, revisa tu bandeja de
            entrada y spam, y haz clic en el enlace de verificación.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleCheckVerification}
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            "Verificar estado"
          )}
        </Button>
        <Button
          onClick={handleSendVerification}
          disabled={isSending || countdown > 0}
        >
          {isSending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : countdown > 0 ? (
            `Reenviar en ${countdown}s`
          ) : (
            "Reenviar correo"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
