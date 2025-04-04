"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";
import Image from "next/image";

const chatMessages = [
  {
    user: "Laurialic Unibe",
    time: "10:25 PM",
    content: "Los entregué a objetos perdidos ya",
    isSelf: false,
  },
  {
    user: "Tú",
    time: "10:35 AM",
    content: "Perdidos Ya!",
    isSelf: true,
  },
  {
    user: "Rafa Unibe",
    time: "11:31 AM",
    content: "Nueva app pa unibe",
    isSelf: false,
  },
  {
    user: "Tú",
    time: "11:36 AM",
    content: "Balbaro será? no me des ideas",
    isSelf: true,
  },
  {
    user: "Rafa Unibe",
    time: "11:42 AM",
    content: "Ya te la di, sin copyright ni na",
    isSelf: false,
  },
  {
    user: "Tú",
    time: "11:42 AM",
    content:
      "Enserio, una plataforma donde si encuentras algo, le tires una foto y la subas con una descripción. Y la lleves a objetos perdidos. Así todo el que se le pierde algo puede buscar ahí antes de ir a Unibe a tirar la aventura.",
    isSelf: true,
  },
  {
    user: "Joan Unibe",
    time: "11:42 AM",
    content: "Esta buena la idea",
    isSelf: false,
  },
  {
    user: "Tú",
    time: "11:36 AM",
    content:
      "Y que todo el que es de corazón noble, se inscriba en la plataforma. Sí @Rafa Unibe o Unibe no la hace, un día que este aburrido en el campo la hago",
    isSelf: true,
  },
];

const contributors = [
  {
    name: "Laurialic",
    role: "Caso de inspiración",
    avatar: "😇",
    message: "Lo entregué a objetos perdidos ya",
  },
  {
    name: "Héctor",
    role: "Creador del meme",
    message: "PerdidosYa!",

    avatar: "🤣",
  },
  {
    name: "Rafa",
    role: "El visionario",
    avatar: "🧐",
    message: "Nueva app para Unibe",
  },
  {
    name: "Joan",
    role: "El creyente",
    avatar: "☁️",
    message: "Esta buena la idea",
  },
  {
    name: "Ruben",
    role: "El scrum master",
    message: "¿Como vamos?",
    avatar: "😎",
  },
];

export default function StoryPage() {
  const [loadedMessages, setLoadedMessages] = useState<number>(0);
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      const loadMessages = async () => {
        for (let i = 0; i < chatMessages.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          setLoadedMessages((prev) => prev + 1);
        }
      };
      loadMessages();
    }
  }, [inView]);

  return (
    <div className="container mx-auto px-4 py-8">
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
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          De un meme a realidad
        </motion.h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Lo que empezó como una broma en un chat de TIC ahora es una plataforma
          real. Así nació PerdidosYa!
        </p>
      </section>
      {/* Context Story */}
      <section className="max-w-3xl mx-auto mb-20 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-2xl">🎧</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Los Audífonos Perdidos</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                25 de marzo · Aula 6
              </p>
            </div>
          </div>

          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              <span className="font-medium">8:38 PM:</span> Un mensaje en el
              grupo de WhatsApp de TIC:
            </p>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm mb-2">
                <span className="font-medium">Laurialic Unibe</span>
                <span className="text-gray-400">8:38 PM</span>
              </div>
              <p className="whitespace-pre-line">
                "Hey @la seccion de la 6 de raisa, se quedaron unos audifonos
                aqui en el aula"
              </p>
            </div>

            <p>Horas después, sin dueño aparecido:</p>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm mb-2">
                <span className="font-medium">Laurialic Unibe</span>
                <span className="text-gray-400">10:25 PM</span>
              </div>
              <p>"Los entregué a objetos perdidos ya"</p>
            </div>

            <p className="mt-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
              ¿Perdidos ya?
            </p>
          </div>
        </div>
      </section>
      {/* Chat Simulation */}
      <section ref={ref} className="py-16 max-w-2xl mx-auto">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>

          {chatMessages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={index < loadedMessages ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: index * 1.5 }}
              className={`mb-4 ${message.isSelf ? "text-right" : ""}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.isSelf
                    ? "ml-auto bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-700"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{message.user}</span>
                  <span className="text-xs opacity-70">{message.time}</span>
                </div>
                <p className="text-sm font-normal whitespace-pre-line text-left">
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Collaborators Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Los cómplices
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {contributors.map((contributor, index) => (
              <motion.div
                key={contributor.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center"
              >
                <div className="h-24 w-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-2xl">{contributor.avatar}</span>
                </div>
                <h3 className="text-xl font-bold">{contributor.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {contributor.role}
                </p>
                <p className="text-xs -mt-2 italic text-gray-400 dark:text-gray-100">
                  {contributor.message}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">¿Y ahora qué?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            El meme cobró vida... ¡Ayúdanos a mejorarlo!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" asChild>
              <a href="https://perdidosya.web.app/catalogo">
                Usar la plataforma
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <a href="https://github.com/Hector-hub/perdidosya">
                Ver código fuente
                <Github className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
