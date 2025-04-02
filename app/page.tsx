"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  MapPin,
  Heart,
  MessageCircle,
  Share2,
  Plus,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import FirebaseDebug from "@/components/firebase-debug";

export default function Home() {
  const [showDebug, setShowDebug] = useState(false);

  // Comprobar parámetro debug en URL
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("debug") === "true" && !showDebug) {
      setShowDebug(true);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {showDebug && <FirebaseDebug />}

      {/* Hero Section */}
      <section className="py-12 md:py-20 text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo-no-bg.png"
            alt="PerdidosYa! Logo"
            width={100}
            height={100}
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          PerdidosYa!
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Conectamos personas con sus objetos perdidos en el campus
          universitario
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/catalogo">
            <Button size="lg" className="gap-2">
              Explorar catálogo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/catalogo">
            <Button size="lg" variant="outline" className="gap-2">
              Reportar objeto
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          ¿Cómo funciona?
        </h2>

        <Tabs defaultValue="perdido" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="perdido">Perdí algo</TabsTrigger>
            <TabsTrigger value="encontrado">Encontré algo</TabsTrigger>
          </TabsList>

          <TabsContent value="perdido" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <CardTitle className="text-center">
                    1. Revisa el catálogo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 dark:text-gray-300">
                    Explora el catálogo para ver si alguien ha encontrado y
                    publicado tu objeto.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <CardTitle className="text-center">
                    2. Publica un anuncio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 dark:text-gray-300">
                    Si no encuentras tu objeto, crea un anuncio con fotos y
                    detalles del objeto perdido.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <CardTitle className="text-center">
                    3. Recibe notificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 dark:text-gray-300">
                    Cuando alguien comente en tu publicación o encuentre tu
                    objeto, recibirás una notificación.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="encontrado" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <CardTitle className="text-center">
                    1. Publica el objeto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 dark:text-gray-300">
                    Toma fotos del objeto encontrado y crea un anuncio con todos
                    los detalles posibles.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <CardTitle className="text-center">
                    2. Indica dónde está
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 dark:text-gray-300">
                    Especifica dónde se puede recoger el objeto o coordina la
                    entrega segura.
                  </p>
                  <p className="text-xs mt-2 text-gray-400 text-center italic">
                    "Llevar a objetos perdidos."
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <CardTitle className="text-center">
                    3. ¡Ayudaste a alguien!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 dark:text-gray-300">
                    El dueño contactará contigo a través de los comentarios para
                    coordinar la recuperación.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* App Showcase */}
      <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl my-8">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Todo lo que necesitas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
              <Share2 className="h-10 w-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Comparte fácilmente
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Comparte las publicaciones para alcanzar más personas y
                encontrar al dueño más rápido.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
              <MessageCircle className="h-10 w-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Comentarios</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Sistema de comentarios para coordinar la entrega sin exponer
                información personal.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
              <MapPin className="h-10 w-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Categorías por ubicación
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Filtra objetos por ubicación en el campus para encontrar lo que
                buscas más rápido.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">¿Listo para comenzar?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Únete a la comunidad y ayuda a que los objetos perdidos encuentren
            su camino a casa.
          </p>
          <Link href="/catalogo">
            <Button size="lg" className="gap-2">
              Ir al catálogo de objetos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
