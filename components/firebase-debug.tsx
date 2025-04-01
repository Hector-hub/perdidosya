"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getApps } from "firebase/app";
import {
  getAuth,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { firebase_app } from "@/lib/firebase";

export default function FirebaseDebug() {
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const generateDebugInfo = async () => {
    try {
      const apps = getApps();
      const auth = getAuth(firebase_app);

      const envVariables = {
        NEXT_PUBLIC_FIREBASE_API_KEY:
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 8) + "..." ||
          "No configurado",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "No configurado",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID:
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "No configurado",
        NEXT_PUBLIC_FIREBASE_APP_ID:
          process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.substring(0, 10) + "..." ||
          "No configurado",
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY:
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.substring(0, 8) + "..." ||
          "No configurado",
      };

      const info = {
        firebaseApp: {
          initialized: apps.length > 0,
          count: apps.length,
          options: {
            apiKey:
              firebase_app?.options?.apiKey?.substring(0, 8) + "..." ||
              "No disponible",
            authDomain: firebase_app?.options?.authDomain || "No disponible",
            projectId: firebase_app?.options?.projectId || "No disponible",
          },
        },
        auth: {
          currentUser: auth.currentUser
            ? {
                uid: auth.currentUser.uid,
                email: auth.currentUser.email,
                displayName: auth.currentUser.displayName,
                isAnonymous: auth.currentUser.isAnonymous,
              }
            : "No hay usuario autenticado",
          initialized: !!auth,
          persistence: "Ver botones abajo",
        },
        environment: envVariables,
        browser: {
          userAgent: navigator.userAgent,
          cookiesEnabled: navigator.cookieEnabled,
          language: navigator.language,
        },
      };

      setDebugInfo(info);
      setShowDebug(true);
    } catch (error) {
      console.error("Error generando información de depuración:", error);
      setDebugInfo({
        error: error instanceof Error ? error.message : "Error desconocido",
      });
      setShowDebug(true);
    }
  };

  const setPersistence = async (type: "local" | "session") => {
    try {
      const auth = getAuth(firebase_app);
      await auth.setPersistence(
        type === "local" ? browserLocalPersistence : browserSessionPersistence
      );
      alert(`Persistencia cambiada a: ${type}`);
    } catch (error) {
      console.error(`Error cambiando persistencia a ${type}:`, error);
      alert(
        `Error cambiando persistencia: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Button onClick={generateDebugInfo} variant="outline" className="mb-4">
        Diagnóstico de Firebase
      </Button>

      {showDebug && debugInfo && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Información de Diagnóstico Firebase</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="firebase-app">
                <AccordionTrigger>
                  Firebase App (
                  {debugInfo.firebaseApp.initialized
                    ? "Inicializado"
                    : "No inicializado"}
                  )
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo.firebaseApp, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="auth">
                <AccordionTrigger>Autenticación</AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo.auth, null, 2)}
                  </pre>
                  <div className="mt-2">
                    <Button
                      onClick={() => setPersistence("local")}
                      size="sm"
                      variant="outline"
                      className="mr-2"
                    >
                      Usar Persistencia Local
                    </Button>
                    <Button
                      onClick={() => setPersistence("session")}
                      size="sm"
                      variant="outline"
                    >
                      Usar Persistencia de Sesión
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="env">
                <AccordionTrigger>Variables de Entorno</AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo.environment, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="browser">
                <AccordionTrigger>Navegador</AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo.browser, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
