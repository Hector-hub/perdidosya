"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  LogIn,
  Home,
  FolderSearch,
  User,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAuth, signOut } from "firebase/auth";
import { firebase_app } from "@/lib/firebase";
import Swal from "sweetalert2";
import { UserNameModal } from "@/components/user-name-modal";
import useAuth from "@/hooks/useAuth";
import Image from "next/image";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const auth = getAuth(firebase_app);
  const { user, isEmailVerified } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleSignOut = async () => {
    try {
      // Mostrar alerta de confirmación antes de cerrar sesión
      const result = await Swal.fire({
        title: "¿Cerrar sesión?",
        text: "¿Estás seguro de que deseas cerrar sesión?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar",
      });

      // Si el usuario cancela, no continuar con el cierre de sesión
      if (!result.isConfirmed) {
        return;
      }

      // Proceder con el cierre de sesión
      await signOut(auth);
      Swal.fire({
        title: "Sesión cerrada",
        text: "Has cerrado sesión correctamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Swal.fire({
        title: "Error",
        text: "Error al cerrar sesión",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <UserNameModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onComplete={() => setIsLoginModalOpen(false)}
        isFromLogin={true}
      />

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Alternar menú</span>
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.webp"
                alt="PerdidosYa! Logo"
                width={40}
                height={40}
              />
              <span className="text-xl hidden sm:block font-bold  bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PerdidosYa!
              </span>
            </Link>
          </div>
          <div className="flex items-center">
            <nav
              className={`${
                isMenuOpen ? "flex" : "hidden"
              } md:hidden absolute top-16 left-0 right-0 z-50 flex-col gap-4 p-4 bg-background border-b`}
            >
              <Link
                href="/"
                className={`text-sm font-medium flex items-center gap-2 ${
                  isActive("/") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Home className="h-4 w-4" />
                Inicio
              </Link>
              <Link
                href="/catalogo"
                className={`text-sm font-medium flex items-center gap-2 ${
                  isActive("/catalogo")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <FolderSearch className="h-4 w-4" />
                Catálogo
              </Link>
            </nav>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/"
                className={`text-sm font-medium flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground ${
                  isActive("/")
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <Home className="h-4 w-4" />
                Inicio
              </Link>
              <Link
                href="/catalogo"
                className={`text-sm font-medium flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground ${
                  isActive("/catalogo")
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <FolderSearch className="h-4 w-4" />
                Catálogo
              </Link>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                suppressHydrationWarning
              >
                {mounted &&
                  (theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  ))}
                <span className="sr-only">Cambiar tema</span>
              </Button>

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 p-1"
                    onClick={toggleUserMenu}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.photoURL || "/placeholder-user.jpg"}
                        alt={user.displayName || "Usuario"}
                      />
                      <AvatarFallback>
                        {user.displayName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block max-w-24 truncate text-sm">
                      {user.displayName || "Usuario"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 py-1 bg-background border rounded-md shadow-lg z-50">
                      <div className="px-3 py-2 border-b">
                        <p className="text-sm font-medium">
                          {user.displayName || "Usuario"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                        {!isEmailVerified && (
                          <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            Correo no verificado
                          </div>
                        )}
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Mi perfil
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-accent text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openLoginModal}
                  className="flex items-center gap-1"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Iniciar sesión
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
