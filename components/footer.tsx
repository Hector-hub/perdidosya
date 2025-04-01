import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} PerdidosYa!. Todos los derechos reservados.
            </div>
            <div className="flex gap-6">
              <Link
                href="/politicas-privacidad"
                className="text-sm text-muted-foreground hover:text-primary transition-colors text-center"
              >
                Política de Privacidad
              </Link>
              <Link
                href="/terminos-condiciones"
                className="text-sm text-muted-foreground hover:text-primary transition-colors text-center"
              >
                Términos y Condiciones
              </Link>
              <Link
                href="/politicas-cookies"
                className="text-sm text-muted-foreground hover:text-primary transition-colors text-center"
              >
                Política de Cookies
              </Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              Powered by{" "}
              <a
                href="https://github.com/hector-hub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Hecrey
              </a>
            </div>
            <div className="text-sm text-muted-foreground text-center flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <a
                href="/LICENSE-2.0.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Licence Apache-2.0
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
