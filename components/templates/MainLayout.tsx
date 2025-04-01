"use client";

import React, {
  useState,
  ReactNode,
  FormEvent,
  ChangeEvent,
  useEffect,
} from "react";
import Link from "next/link";
import { FaSearch, FaSun, FaMoon, FaPlus, FaSignOutAlt } from "react-icons/fa";
import Avatar from "../atoms/Avatar";
import Button from "../atoms/Button";
import useAuth from "../../hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const [dailyPostCount, setDailyPostCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(
        searchTerm.trim()
      )}`;
    }
  };

  // Verificar cuántas publicaciones ha hecho el usuario hoy
  useEffect(() => {
    const checkUserDailyPosts = async () => {
      if (!user) {
        setDailyPostCount(0);
        return;
      }

      try {
        setIsLoading(true);

        // Calcular inicio y fin del día actual
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const startTimestamp = Timestamp.fromDate(startOfDay);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const endTimestamp = Timestamp.fromDate(endOfDay);

        // Consulta para contar publicaciones del usuario hoy
        const itemsRef = collection(db, "items");
        const q = query(
          itemsRef,
          where("authorId", "==", user.uid),
          where("createdAt", ">=", startTimestamp),
          where("createdAt", "<=", endTimestamp)
        );

        const querySnapshot = await getDocs(q);
        setDailyPostCount(querySnapshot.size);
      } catch (error) {
        console.error("Error al verificar publicaciones diarias:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserDailyPosts();

    // Configurar un intervalo para actualizar el contador cada 5 minutos
    const interval = setInterval(checkUserDailyPosts, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and main nav */}
            <div className="flex">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  PerdidosYa!
                </span>
              </Link>
            </div>

            {/* Search bar */}
            <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                    placeholder="Buscar objetos perdidos..."
                    className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <FaSearch />
                  </button>
                </div>
              </form>
            </div>

            {/* Right side nav */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={toggleTheme} className="p-2">
                {darkMode ? <FaSun /> : <FaMoon />}
              </Button>

              {user ? (
                <>
                  <Link href="/new">
                    <Button
                      variant="primary"
                      className="hidden md:flex items-center gap-2"
                    >
                      <FaPlus size={14} />
                      <span>Publicar</span>
                    </Button>
                  </Link>

                  <div className="relative">
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="flex items-center space-x-2"
                    >
                      <Avatar
                        src={user.photoURL || undefined}
                        alt={user.displayName || "Usuario"}
                        size="sm"
                      />
                    </button>

                    {/* Dropdown menu */}
                    {mobileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                        <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                          {user.displayName || user.email}
                        </div>
                        <hr className="border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <FaSignOutAlt />
                          <span>Cerrar sesión</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="primary">Iniciar sesión</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search bar */}
      <div className="md:hidden bg-white dark:bg-gray-800 shadow-sm fixed w-full top-16 z-40">
        <div className="p-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Buscar objetos perdidos..."
                className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FaSearch />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {user && dailyPostCount >= 3 && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <p className="text-amber-800 dark:text-amber-200">
              Has alcanzado el límite de 3 publicaciones por día. Podrás
              publicar más objetos mañana.
            </p>
          </div>
        )}
        {children}
      </main>

      {/* Mobile new post button */}
      {user && (
        <div className="md:hidden fixed bottom-6 right-6">
          <Link href="/new">
            <Button
              variant="primary"
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
              disabled={dailyPostCount >= 3}
            >
              <FaPlus size={24} />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
